"""
ADMIN ROUTES  — owned by: Backend Person 1
Endpoints:
  GET  /api/admin/stats          — dashboard stat cards + weekly chart data
  GET  /api/admin/guards         — list all guard accounts
  POST /api/admin/guards         — invite a new guard (sends invitation email)
  PATCH /api/admin/guards/<id>   — edit guard name/email
  PATCH /api/admin/guards/<id>/activate   — activate a guard
  PATCH /api/admin/guards/<id>/deactivate — deactivate a guard
  GET  /api/admin/items-claims   — all items and claims with filters + export
  GET  /api/admin/audit-log      — paginated audit log with filters
"""
from flask import Blueprint, request, jsonify
from ..models import User, Item, Claim, AuditLog
from ..utils.decorators import role_required

admin_bp = Blueprint('admin', __name__)


@admin_bp.get('/stats')
@role_required('admin')
def stats():
    # TODO: return items_logged, claims_approved, items_collected, unclaimed counts
    # TODO: return weekly breakdown arrays for the last 6 weeks
    return jsonify({'message': 'stats – TODO'}), 501


@admin_bp.get('/guards')
@role_required('admin')
def list_guards():
    # TODO: return all users with role='guard', include is_active and last_active_at
    return jsonify([]), 200


@admin_bp.post('/guards')
@role_required('admin')
def add_guard():
    # TODO: validate full_name, email
    # TODO: create User with role='guard', is_active=True, random temp password
    # TODO: (stretch) send invitation email
    # TODO: write AuditLog, return 201
    return jsonify({'message': 'add_guard – TODO'}), 501


@admin_bp.patch('/guards/<int:guard_id>')
@role_required('admin')
def edit_guard(guard_id):
    # TODO: update full_name or email
    return jsonify({'message': 'edit_guard – TODO'}), 501


@admin_bp.patch('/guards/<int:guard_id>/deactivate')
@role_required('admin')
def deactivate_guard(guard_id):
    # TODO: set is_active=False, write AuditLog entry ('guard_deactivated')
    return jsonify({'message': 'deactivate – TODO'}), 501


@admin_bp.patch('/guards/<int:guard_id>/activate')
@role_required('admin')
def activate_guard(guard_id):
    # TODO: set is_active=True, write AuditLog entry ('guard_activated')
    return jsonify({'message': 'activate – TODO'}), 501


@admin_bp.get('/items-claims')
@role_required('admin')
def items_and_claims():
    # TODO: query params — tab (items|claims), status, search, page
    # TODO: support CSV export when ?export=true
    return jsonify([]), 200


@admin_bp.get('/audit-log')
@role_required('admin')
def audit_log():
    # TODO: query params — date_from, date_to, role, action, search, page
    return jsonify([]), 200
