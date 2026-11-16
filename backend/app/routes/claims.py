"""
CLAIMS ROUTES  — owned by: Backend Person 2
Endpoints:
  POST  /api/claims               — student: submit a claim
  GET   /api/claims/mine          — student: list own claims
  GET   /api/claims/pending       — guard: list pending claims
  GET   /api/claims/<id>          — guard/admin: full claim with private evidence
  PATCH /api/claims/<id>/decision — guard: approve or reject
"""
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import Claim, Item, AuditLog
from ..models.claim import MAX_CLAIM_ATTEMPTS
from ..utils.decorators import role_required
from ..utils.helpers import save_upload, next_reference

claims_bp = Blueprint('claims', __name__)

ALLOWED_PROOF_TYPES = {'jpg', 'jpeg', 'png', 'pdf'}


def claim_summary_dict(claim):
    """Shared shape for list views (My Claims, Pending Claims tables)."""
    return {
        'id': claim.id,
        'reference': claim.reference,
        'itemReference': claim.item.reference,
        'itemDescription': claim.item.public_description,
        'status': claim.status,
        'submittedAt': claim.submitted_at.isoformat(),
    }


@claims_bp.post('/')
@jwt_required()
def submit_claim():
    item_id = request.form.get('itemId')
    item = Item.query.get_or_404(item_id)

    if item.status != 'in_store':
        return jsonify({'error': 'This item is not available to claim'}), 400

    claimant_id = get_jwt_identity()

    # Count this user's past attempts on this specific item, not all their claims.
    attempts = Claim.query.filter_by(item_id=item.id, claimant_id=claimant_id).count()
    if attempts >= MAX_CLAIM_ATTEMPTS:
        return jsonify({'error': 'You have reached the maximum number of attempts for this item'}), 400

    proof_file = request.files.get('proof')
    proof_url = save_upload(proof_file, 'claims', ALLOWED_PROOF_TYPES) if proof_file else None

    claim = Claim(
        reference=next_reference('CL', Claim, 'reference'),
        item_id=item.id,
        claimant_id=claimant_id,
        identifying_marks=request.form.get('identifyingMarks'),
        hidden_details=request.form.get('hiddenDetails'),
        lost_when_where=request.form.get('lostWhenWhere'),
        proof_url=proof_url,
    )
    db.session.add(claim)

    # The item is reserved the moment a claim is submitted, so nobody
    # else can submit a competing claim while this one is reviewed.
    item.status = 'claim_pending'

    db.session.add(AuditLog(
        action='claim_submitted',
        actor_id=claimant_id,
        record_type='claim',
        record_id=claim.reference,
    ))
    db.session.commit()

    return jsonify(claim_summary_dict(claim)), 201


@claims_bp.get('/mine')
@jwt_required()
def my_claims():
    claimant_id = get_jwt_identity()
    claims = Claim.query.filter_by(claimant_id=claimant_id).order_by(Claim.submitted_at.desc()).all()
    return jsonify([claim_summary_dict(c) for c in claims]), 200


@claims_bp.get('/pending')
@role_required('guard', 'admin')
def pending_claims():
    claims = (
        Claim.query
        .filter(Claim.status.in_(['submitted', 'in_review']))
        .order_by(Claim.submitted_at.asc())
        .all()
    )
    return jsonify([claim_summary_dict(c) for c in claims]), 200


@claims_bp.get('/<int:claim_id>')
@role_required('guard', 'admin')
def get_claim(claim_id):
    claim = Claim.query.get_or_404(claim_id)
    item = claim.item

    # This is the data behind mockup page 12's side-by-side comparison:
    # the claimant's private answers on the left, the item's stored
    # private record on the right. The guard compares them by eye.
    return jsonify({
        'id': claim.id,
        'reference': claim.reference,
        'status': claim.status,
        'submittedAt': claim.submitted_at.isoformat(),
        'claimantAnswers': {
            'identifyingMarks': claim.identifying_marks,
            'hiddenDetails': claim.hidden_details,
            'lostWhenWhere': claim.lost_when_where,
            'proofUrl': claim.proof_url,
        },
        'itemRecord': {
            'reference': item.reference,
            'category': item.category,
            'privateDetails': item.private_details,
            'loggedAt': item.logged_at.isoformat(),
        },
    }), 200


@claims_bp.patch('/<int:claim_id>/decision')
@role_required('guard')
def decide(claim_id):
    claim = Claim.query.get_or_404(claim_id)
    item = claim.item

    decision = request.json.get('decision') if request.is_json else None
    reason = request.json.get('reason') if request.is_json else None

    if decision not in ('approved', 'rejected'):
        return jsonify({'error': "decision must be 'approved' or 'rejected'"}), 400
    if decision == 'rejected' and not reason:
        return jsonify({'error': 'reason is required when rejecting a claim'}), 400

    claim.status = decision
    claim.decision_reason = reason
    claim.reviewed_by_id = get_jwt_identity()
    claim.reviewed_at = datetime.now(timezone.utc)

    if decision == 'approved':
        # Item stays claim_pending — it only becomes collected once the
        # owner physically shows up, is ID-checked, and signs (handover.py).
        pass
    else:
        # Rejected: free the item up so someone else can claim it.
        item.status = 'in_store'

    db.session.add(AuditLog(
        action=f'claim_{decision}',
        actor_id=get_jwt_identity(),
        record_type='claim',
        record_id=claim.reference,
        detail=reason,
    ))
    db.session.commit()

    return jsonify(claim_summary_dict(claim)), 200
