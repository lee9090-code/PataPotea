"""
ITEMS ROUTES  — owned by: Backend Person 2
Endpoints:
  GET  /api/items           — public list (search, filter by category/date/area)
  GET  /api/items/<id>      — public item detail
  POST /api/items           — guard: log a new found item (multipart, with photo)
  PATCH /api/items/<id>/status — guard/admin: update item status
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import Item, AuditLog
from ..models.item import ITEM_STATUSES
from ..utils.decorators import role_required
from ..utils.helpers import save_upload, next_reference

items_bp = Blueprint('items', __name__)

ALLOWED_IMAGE_TYPES = {'jpg', 'jpeg', 'png'}


@items_bp.get('/')
def list_items():
    # request.args holds query-string params, e.g. /api/items?category=Bags&q=backpack
    query = Item.query

    search_text = request.args.get('q')
    if search_text:
        # ilike = case-insensitive LIKE. The %...% means "contains this text anywhere".
        query = query.filter(Item.public_description.ilike(f'%{search_text}%'))

    category = request.args.get('category')
    if category:
        query = query.filter(Item.category == category)

    area = request.args.get('area')
    if area:
        query = query.filter(Item.location_found == area)

    # date_range as "2026-11-01,2026-11-16" — a single query param holding two dates
    date_range = request.args.get('date_range')
    if date_range and ',' in date_range:
        start_str, end_str = date_range.split(',', 1)
        query = query.filter(Item.date_found.between(start_str, end_str))

    items = query.order_by(Item.date_found.desc()).all()
    return jsonify([item.to_public_dict() for item in items]), 200


@items_bp.get('/<int:item_id>')
def get_item(item_id):
    # Item.query.get_or_404 fetches by primary key, or automatically
    # returns a 404 response if no row with that id exists. Saves us
    # from writing "if item is None: return 404" by hand every time.
    item = Item.query.get_or_404(item_id)
    return jsonify(item.to_public_dict()), 200


@items_bp.post('/')
@role_required('guard')
def log_item():
    # request.form holds text fields; request.files holds the uploaded photo.
    # Both come from the multipart form the guard submits (mockup page 8).
    category = request.form.get('category')
    public_description = request.form.get('publicDescription')
    location_found = request.form.get('locationFound')
    date_found = request.form.get('dateFound')  # e.g. "2026-11-16"

    # Guard clause: bail out early with a 400 if a required field is missing.
    # This keeps the "happy path" below free of nested if/else.
    if not all([category, public_description, location_found, date_found]):
        return jsonify({'error': 'category, publicDescription, locationFound and dateFound are required'}), 400

    # Optional photo. request.files behaves like a dict: .get() returns None if absent.
    photo = request.files.get('photo')
    image_url = save_upload(photo, 'items', ALLOWED_IMAGE_TYPES) if photo else None

    reference = next_reference('PT', Item, 'reference')

    item = Item(
        reference=reference,
        category=category,
        public_description=public_description,
        location_found=location_found,
        date_found=date_found,
        image_url=image_url,
        private_details=request.form.get('privateDetails'),
        finder_name=request.form.get('finderName'),
        finder_contact=request.form.get('finderContact'),
        logged_by_id=get_jwt_identity(),
    )
    db.session.add(item)
    db.session.flush()  # assigns item.id without committing yet, so we can log it below

    audit = AuditLog(
        action='item_logged',
        actor_id=get_jwt_identity(),
        record_type='item',
        record_id=item.reference,
    )
    db.session.add(audit)
    db.session.commit()  # saves both rows together, as one unit

    return jsonify(item.to_public_dict()), 201


@items_bp.patch('/<int:item_id>/status')
@role_required('guard', 'admin')
def update_status(item_id):
    item = Item.query.get_or_404(item_id)

    new_status = request.json.get('status') if request.is_json else None
    if new_status not in ITEM_STATUSES:
        return jsonify({'error': f'status must be one of {ITEM_STATUSES}'}), 400

    item.status = new_status
    db.session.add(AuditLog(
        action='item_status_updated',
        actor_id=get_jwt_identity(),
        record_type='item',
        record_id=item.reference,
        detail=f'status changed to {new_status}',
    ))
    db.session.commit()

    return jsonify(item.to_public_dict()), 200
