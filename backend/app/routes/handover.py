"""
HANDOVER ROUTES  — owned by: Backend Person 2
Endpoints:
  POST /api/handover/<claim_id> — guard: record ID check + signature → mark collected
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity
from ..extensions import db
from ..models import Claim, Handover, AuditLog
from ..utils.decorators import role_required

handover_bp = Blueprint('handover', __name__)


@handover_bp.post('/<int:claim_id>')
@role_required('guard')
def record_handover(claim_id):
    claim = Claim.query.get_or_404(claim_id)
    item = claim.item

    if claim.status != 'approved':
        return jsonify({'error': 'Only approved claims can be handed over'}), 400

    id_checked = request.json.get('idChecked') if request.is_json else None
    signature_data = request.json.get('signatureData') if request.is_json else None

    if not id_checked:
        return jsonify({'error': 'ID must be checked before collection'}), 400
    if not signature_data:
        return jsonify({'error': 'Owner signature is required before collection'}), 400

    handover = Handover(
        claim_id=claim.id,
        guard_id=get_jwt_identity(),
        id_checked=True,
        signature_data=signature_data,
    )
    db.session.add(handover)

    # This is the one moment both records become final.
    claim.status = 'collected'
    item.status = 'collected'

    db.session.add(AuditLog(
        action='item_collected',
        actor_id=get_jwt_identity(),
        record_type='claim',
        record_id=claim.reference,
    ))
    db.session.commit()

    return jsonify({
        'claimReference': claim.reference,
        'itemReference': item.reference,
        'status': 'collected',
        'collectedAt': handover.collected_at.isoformat(),
    }), 201
