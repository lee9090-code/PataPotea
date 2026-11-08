"""
ITEMS ROUTES  — owned by: Backend Person 2
Endpoints:
  GET  /api/items           — public list (search, filter by category/date/area)
  GET  /api/items/<id>      — public item detail
  POST /api/items           — guard: log a new found item (multipart, with photo)
  PATCH /api/items/<id>/status — guard/admin: update item status
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from ..extensions import db
from ..models import Item
from ..utils.decorators import role_required

items_bp = Blueprint('items', __name__)


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
    # TODO: validate form fields (category, public_description, location_found, date_found)
    # TODO: save uploaded photo via save_upload()
    # TODO: generate PT-XXXX reference via next_reference()
    # TODO: create Item, write AuditLog entry, return 201
    return jsonify({'message': 'log_item – TODO'}), 501


@items_bp.patch('/<int:item_id>/status')
@role_required('guard', 'admin')
def update_status(item_id):
    # TODO: validate new status is a valid ITEM_STATUS
    # TODO: update item.status, write AuditLog, return updated item
    return jsonify({'message': 'update_status – TODO'}), 501
