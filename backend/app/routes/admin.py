
"""
ADMIN ROUTES — Backend Person 1

Endpoints:
GET    /api/admin/stats
GET    /api/admin/guards
POST   /api/admin/guards
PATCH  /api/admin/guards/<id>
PATCH  /api/admin/guards/<id>/activate
PATCH  /api/admin/guards/<id>/deactivate
GET    /api/admin/items-claims
GET    /api/admin/audit-log
"""

from flask import Blueprint, request, jsonify, Response
from flask_jwt_extended import get_jwt_identity
from datetime import datetime, timedelta, timezone, date, time
from sqlalchemy import func, or_
import secrets
import csv
import io

from ..extensions import db
from ..models import User, Item, Claim, AuditLog
from ..utils.decorators import role_required


admin_bp = Blueprint('admin', __name__)


# =========================================================
# DASHBOARD STATISTICS
# =========================================================

@admin_bp.get('/stats')
@role_required('admin')
def stats():

    items_logged = Item.query.count()
    claims_approved = Claim.query.filter_by(status='approved').count()
    items_collected = Item.query.filter_by(status='collected').count()
    unclaimed_items = Item.query.filter_by(status='unclaimed').count()

    today = datetime.now(timezone.utc).date()
    current_week = today - timedelta(days=today.weekday())
    six_weeks_ago = current_week - timedelta(weeks=5)

    weekly_items = db.session.query(
        func.date_trunc('week', Item.logged_at).label('week'),
        func.count(Item.id)
    ).filter(
        Item.logged_at >= datetime.combine(
            six_weeks_ago, datetime.min.time(), tzinfo=timezone.utc
        )
    ).group_by(
        func.date_trunc('week', Item.logged_at)
    ).all()

    weekly_claims = db.session.query(
        func.date_trunc('week', Claim.submitted_at).label('week'),
        func.count(Claim.id)
    ).filter(
        Claim.submitted_at >= datetime.combine(
            six_weeks_ago, datetime.min.time(), tzinfo=timezone.utc
        )
    ).group_by(
        func.date_trunc('week', Claim.submitted_at)
    ).all()

    item_counts = {
        week.date(): count for week, count in weekly_items
    }

    claim_counts = {
        week.date(): count for week, count in weekly_claims
    }

    weekly_breakdown = []

    for i in range(6):
        week_start = six_weeks_ago + timedelta(weeks=i)

        weekly_breakdown.append({
            'weekStarting': week_start.isoformat(),
            'itemsLogged': item_counts.get(week_start, 0),
            'claimsSubmitted': claim_counts.get(week_start, 0)
        })

    return jsonify({
        'itemsLogged': items_logged,
        'claimsApproved': claims_approved,
        'itemsCollected': items_collected,
        'unclaimedItems': unclaimed_items,
        'weeklyBreakdown': weekly_breakdown
    }), 200


# =========================================================
# LIST GUARDS
# =========================================================

@admin_bp.get('/guards')
@role_required('admin')
def list_guards():

    guards = User.query.filter_by(
        role='guard'
    ).order_by(User.id.asc()).all()

    return jsonify([
        {
            **guard.to_dict(),
            'isActive': guard.is_active,
            'lastActiveAt': (
                guard.last_active_at.isoformat()
                if guard.last_active_at else None
            ),
            'createdAt': (
                guard.created_at.isoformat()
                if guard.created_at else None
            )
        }
        for guard in guards
    ]), 200


# =========================================================
# CREATE GUARD
# =========================================================

@admin_bp.post('/guards')
@role_required('admin')
def add_guard():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({'error': 'Request body must be valid JSON'}), 400

    full_name = data.get('fullName', '')
    email = data.get('email', '')

    if not isinstance(full_name, str) or not isinstance(email, str):
        return jsonify({'error': 'Name and email must be text'}), 400

    full_name = full_name.strip()
    email = email.strip().lower()

    if not full_name or not email:
        return jsonify({'error': 'Full name and email are required'}), 400

    if len(full_name) > 120 or len(email) > 120:
        return jsonify({'error': 'One or more fields exceed the allowed length'}), 400

    if '@' not in email or email.startswith('@') or email.endswith('@'):
        return jsonify({'error': 'Please provide a valid email address'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email is already registered'}), 409

    temporary_password = secrets.token_urlsafe(12)

    guard = User(
        full_name=full_name,
        student_or_staff_number=f'GUARD{secrets.token_hex(4).upper()}',
        email=email,
        role='guard',
        is_active=True
    )

    guard.set_password(temporary_password)

    db.session.add(guard)
    db.session.flush()

    audit = AuditLog(
        action='guard_added',
        actor_id=int(get_jwt_identity()),
        record_type='user',
        record_id=str(guard.id),
        detail=f'Guard account created for {guard.email}'
    )

    db.session.add(audit)
    db.session.commit()

    return jsonify({
        'message': 'Guard created successfully',
        'guard': guard.to_dict(),
        'temporaryPassword': temporary_password
    }), 201


# =========================================================
# EDIT GUARD
# =========================================================

@admin_bp.patch('/guards/<int:guard_id>')
@role_required('admin')
def edit_guard(guard_id):

    guard = User.query.filter_by(
        id=guard_id,
        role='guard'
    ).first()

    if not guard:
        return jsonify({'error': 'Guard not found'}), 404

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({'error': 'Request body must be valid JSON'}), 400

    full_name = data.get('fullName', guard.full_name)
    email = data.get('email', guard.email)

    if not isinstance(full_name, str) or not isinstance(email, str):
        return jsonify({'error': 'Name and email must be text'}), 400

    full_name = full_name.strip()
    email = email.strip().lower()

    if not full_name or not email:
        return jsonify({'error': 'Name and email are required'}), 400

    if len(full_name) > 120 or len(email) > 120:
        return jsonify({'error': 'Field exceeds allowed length'}), 400

    if '@' not in email or email.startswith('@') or email.endswith('@'):
        return jsonify({'error': 'Please provide a valid email address'}), 400

    existing = User.query.filter(
        User.email == email,
        User.id != guard.id
    ).first()

    if existing:
        return jsonify({'error': 'Email already registered'}), 409

    guard.full_name = full_name
    guard.email = email

    audit = AuditLog(
        action='guard_updated',
        actor_id=int(get_jwt_identity()),
        record_type='user',
        record_id=str(guard.id),
        detail=f'Guard account updated: {guard.email}'
    )

    db.session.add(audit)
    db.session.commit()

    return jsonify({
        'message': 'Guard updated successfully',
        'guard': guard.to_dict()
    }), 200


# =========================================================
# ACTIVATE GUARD
# =========================================================

@admin_bp.patch('/guards/<int:guard_id>/activate')
@role_required('admin')
def activate_guard(guard_id):

    guard = User.query.filter_by(
        id=guard_id,
        role='guard'
    ).first()

    if not guard:
        return jsonify({'error': 'Guard not found'}), 404

    if guard.is_active:
        return jsonify({'message': 'Guard is already active'}), 200

    guard.is_active = True

    audit = AuditLog(
        action='guard_activated',
        actor_id=int(get_jwt_identity()),
        record_type='user',
        record_id=str(guard.id),
        detail=f'Guard account activated: {guard.email}'
    )

    db.session.add(audit)
    db.session.commit()

    return jsonify({
        'message': 'Guard activated successfully',
        'guard': guard.to_dict()
    }), 200


# =========================================================
# DEACTIVATE GUARD
# =========================================================

@admin_bp.patch('/guards/<int:guard_id>/deactivate')
@role_required('admin')
def deactivate_guard(guard_id):

    guard = User.query.filter_by(
        id=guard_id,
        role='guard'
    ).first()

    if not guard:
        return jsonify({'error': 'Guard not found'}), 404

    if not guard.is_active:
        return jsonify({'message': 'Guard is already deactivated'}), 200

    guard.is_active = False

    audit = AuditLog(
        action='guard_deactivated',
        actor_id=int(get_jwt_identity()),
        record_type='user',
        record_id=str(guard.id),
        detail=f'Guard account deactivated: {guard.email}'
    )

    db.session.add(audit)
    db.session.commit()

    return jsonify({
        'message': 'Guard deactivated successfully',
        'guard': guard.to_dict()
    }), 200


# =========================================================
# ITEMS AND CLAIMS MANAGEMENT
# =========================================================

@admin_bp.get('/items-claims')
@role_required('admin')
def items_and_claims():

    tab = request.args.get('tab', 'items').lower()
    status = request.args.get('status', '').strip().lower()
    search = request.args.get('search', '').strip()
    export = request.args.get('export', 'false').lower() == 'true'

    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
    except ValueError:
        return jsonify({'error': 'Page values must be integers'}), 400

    if tab not in ('items', 'claims'):
        return jsonify({'error': 'Tab must be items or claims'}), 400

    if page < 1 or per_page < 1 or per_page > 100:
        return jsonify({'error': 'Invalid pagination values'}), 400

    if tab == 'items':

        query = Item.query

        if status:
            query = query.filter(Item.status == status)

        if search:
            term = f'%{search}%'
            query = query.filter(or_(
                Item.reference.ilike(term),
                Item.category.ilike(term),
                Item.public_description.ilike(term),
                Item.location_found.ilike(term)
            ))

        query = query.order_by(Item.logged_at.desc())

        def serialize(item):
            return {
                **item.to_public_dict(),
                'loggedAt': (
                    item.logged_at.isoformat()
                    if item.logged_at else None
                )
            }

        filename = 'items.csv'

    else:

        query = Claim.query.join(
            Claim.item
        ).join(
            Claim.claimant
        )

        if status:
            query = query.filter(Claim.status == status)

        if search:
            term = f'%{search}%'
            query = query.filter(or_(
                Claim.reference.ilike(term),
                Item.reference.ilike(term),
                Item.public_description.ilike(term),
                User.full_name.ilike(term),
                User.email.ilike(term)
            ))

        query = query.order_by(Claim.submitted_at.desc())

        def serialize(claim):
            return {
                'id': claim.id,
                'reference': claim.reference,
                'itemReference': claim.item.reference,
                'itemDescription': claim.item.public_description,
                'claimantName': claim.claimant.full_name,
                'claimantEmail': claim.claimant.email,
                'status': claim.status,
                'identifyingMarks': claim.identifying_marks,
                'hiddenDetails': claim.hidden_details,
                'lostWhenWhere': claim.lost_when_where,
                'proofUrl': claim.proof_url,
                'decisionReason': claim.decision_reason,
                'submittedAt': (
                    claim.submitted_at.isoformat()
                    if claim.submitted_at else None
                ),
                'reviewedAt': (
                    claim.reviewed_at.isoformat()
                    if claim.reviewed_at else None
                )
            }

        filename = 'claims.csv'

    if export:

        records = query.all()
        rows = [serialize(record) for record in records]

        if not rows:
            return jsonify({
                'message': 'No records found to export'
            }), 200

        output = io.StringIO()
        writer = csv.DictWriter(
            output,
            fieldnames=rows[0].keys()
        )

        writer.writeheader()
        writer.writerows(rows)

        return Response(
            output.getvalue(),
            mimetype='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename={filename}'
            }
        )

    pagination = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    return jsonify({
        'tab': tab,
        'data': [
            serialize(record)
            for record in pagination.items
        ],
        'pagination': {
            'page': pagination.page,
            'perPage': pagination.per_page,
            'totalRecords': pagination.total,
            'totalPages': pagination.pages,
            'hasNext': pagination.has_next,
            'hasPrevious': pagination.has_prev
        }
    }), 200


# =========================================================
# AUDIT LOG WITH FILTERS AND PAGINATION
# =========================================================

@admin_bp.get('/audit-log')
@role_required('admin')
def audit_log():

    date_from = request.args.get('date_from', '').strip()
    date_to = request.args.get('date_to', '').strip()
    role = request.args.get('role', '').strip().lower()
    action = request.args.get('action', '').strip().lower()
    search = request.args.get('search', '').strip()

    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
    except ValueError:
        return jsonify({'error': 'Page values must be integers'}), 400

    if page < 1 or per_page < 1 or per_page > 100:
        return jsonify({'error': 'Invalid pagination values'}), 400

    query = AuditLog.query.join(AuditLog.actor)

    try:
        if date_from:
            start_date = date.fromisoformat(date_from)
            query = query.filter(
                AuditLog.timestamp >= datetime.combine(
                    start_date, time.min
                )
            )

        if date_to:
            end_date = date.fromisoformat(date_to)
            query = query.filter(
                AuditLog.timestamp < datetime.combine(
                    end_date + timedelta(days=1),
                    time.min
                )
            )

    except ValueError:
        return jsonify({
            'error': 'Dates must use YYYY-MM-DD format'
        }), 400

    if role:
        query = query.filter(User.role == role)

    if action:
        query = query.filter(
            AuditLog.action.ilike(f'%{action}%')
        )

    if search:
        term = f'%{search}%'

        query = query.filter(or_(
            AuditLog.action.ilike(term),
            AuditLog.record_id.ilike(term),
            AuditLog.record_type.ilike(term),
            AuditLog.detail.ilike(term),
            User.full_name.ilike(term)
        ))

    query = query.order_by(AuditLog.timestamp.desc())

    pagination = query.paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )

    return jsonify({
        'data': [
            {
                'id': log.id,
                'action': log.action,
                'actorId': log.actor_id,
                'actorName': log.actor.full_name,
                'actorRole': log.actor.role,
                'recordType': log.record_type,
                'recordId': log.record_id,
                'detail': log.detail,
                'timestamp': log.timestamp.isoformat()
            }
            for log in pagination.items
        ],
        'pagination': {
            'page': pagination.page,
            'perPage': pagination.per_page,
            'totalRecords': pagination.total,
            'totalPages': pagination.pages,
            'hasNext': pagination.has_next,
            'hasPrevious': pagination.has_prev
        }
    }), 200
