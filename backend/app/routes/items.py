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
from ..utils.decorators import role_required
from ..utils.helpers import save_upload, next_reference

items_bp = Blueprint('items', __name__)

ALLOWED_IMAGE_TYPES = {'jpg', 'jpeg', 'png'}


@items_bp.get('/')
def list_items():
    # TODO: query params — q (text search), category, date_range, area
    # TODO: return paginated list of item.to_public_dict()
    return jsonify([]), 200


@items_bp.get('/<int:item_id>')
def get_item(item_id):
    # TODO: return item.to_public_dict()
    return jsonify({'message': 'get_item – TODO'}), 501


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
    # TODO: validate new status is a valid ITEM_STATUS
    # TODO: update item.status, write AuditLog, return updated item
    return jsonify({'message': 'update_status – TODO'}), 501
