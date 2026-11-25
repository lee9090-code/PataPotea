"""
LOST REPORTS ROUTES
Endpoints:
  POST /api/lost-reports      — logged in: submit a lost report
  GET  /api/lost-reports/mine — logged in: list own lost reports
  GET  /api/lost-reports      — guard/admin: list all lost reports
"""
from datetime import datetime

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..extensions import db
from ..models import LostReport, AuditLog
from ..utils.decorators import role_required
from ..utils.helpers import next_reference

lost_reports_bp = Blueprint('lost_reports', __name__)


@lost_reports_bp.post('/')
@jwt_required()
def submit_lost_report():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({'error': 'Request body must be valid JSON'}), 400

    category = data.get('category', '').strip()
    description = data.get('description', '').strip()
    location_lost = data.get('locationLost', '').strip()
    date_lost = data.get('dateLost', '')

    if not category or not description or not date_lost:
        return jsonify({'error': 'Category, description and date lost are required'}), 400

    try:
        date_lost = datetime.strptime(date_lost, '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return jsonify({'error': 'dateLost must be in YYYY-MM-DD format'}), 400

    report = LostReport(
        reference=next_reference('LR', LostReport, 'reference'),
        category=category,
        description=description,
        location_lost=location_lost,
        date_lost=date_lost,
        reporter_id=get_jwt_identity(),
    )
    db.session.add(report)
    db.session.flush()

    db.session.add(AuditLog(
        action='lost_report_submitted',
        actor_id=get_jwt_identity(),
        record_type='lost_report',
        record_id=report.reference,
    ))
    db.session.commit()

    return jsonify(report.to_dict()), 201


@lost_reports_bp.get('/mine')
@jwt_required()
def my_lost_reports():
    user_id = get_jwt_identity()

    reports = LostReport.query.filter_by(
        reporter_id=user_id
    ).order_by(LostReport.reported_at.desc()).all()

    return jsonify([report.to_dict() for report in reports]), 200


@lost_reports_bp.get('/')
@role_required('guard', 'admin')
def list_lost_reports():
    status = request.args.get('status', '').strip().lower()

    query = LostReport.query

    if status:
        query = query.filter_by(status=status)

    reports = query.order_by(LostReport.reported_at.desc()).all()

    return jsonify([report.to_guard_dict() for report in reports]), 200
