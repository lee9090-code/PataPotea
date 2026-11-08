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
    # TODO: verify claim exists and status == 'approved'
    # TODO: validate id_checked == True and signature_data is present
    # TODO: create Handover record (guard_id, id_checked, signature_data, collected_at)
    # TODO: update claim.status → 'collected'
    # TODO: update item.status → 'collected'
    # TODO: write AuditLog entry ('item_collected')
    # TODO: return success response
    return jsonify({'message': 'record_handover – TODO'}), 501
