"""
CLAIMS ROUTES  — owned by: Backend Person 2
Endpoints:
  POST  /api/claims               — student: submit a claim
  GET   /api/claims/mine          — student: list own claims
  GET   /api/claims/pending       — guard: list pending claims
  GET   /api/claims/<id>          — guard/admin: full claim with private evidence
  PATCH /api/claims/<id>/decision — guard: approve or reject
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..extensions import db
from ..models import Claim, Item
from ..utils.decorators import role_required

claims_bp = Blueprint('claims', __name__)


@claims_bp.post('/')
@jwt_required()
def submit_claim():
    # TODO: get current user (student/staff only)
    # TODO: check item exists and status is in_store
    # TODO: enforce MAX_CLAIM_ATTEMPTS per (user, item) pair
    # TODO: save optional proof file via save_upload()
    # TODO: generate CL-XXXX reference
    # TODO: create Claim, update item status → claim_pending
    # TODO: write AuditLog, return 201
    return jsonify({'message': 'submit_claim – TODO'}), 501


@claims_bp.get('/mine')
@jwt_required()
def my_claims():
    # TODO: return all claims where claimant_id == current user id
    return jsonify([]), 200


@claims_bp.get('/pending')
@role_required('guard', 'admin')
def pending_claims():
    # TODO: return claims where status == 'submitted' or 'in_review', ordered by submitted_at
    return jsonify([]), 200


@claims_bp.get('/<int:claim_id>')
@role_required('guard', 'admin')
def get_claim(claim_id):
    # TODO: return full claim including private fields (identifying_marks, hidden_details)
    # TODO: also return the item's private_details for side-by-side comparison
    return jsonify({'message': 'get_claim – TODO'}), 501


@claims_bp.patch('/<int:claim_id>/decision')
@role_required('guard')
def decide(claim_id):
    # TODO: validate decision is 'approved' or 'rejected'
    # TODO: require decision_reason if rejecting
    # TODO: update claim.status, claim.reviewed_by_id, claim.reviewed_at
    # TODO: if approved, item status stays claim_pending (collected after handover)
    # TODO: if rejected, item status → in_store (available for new claims)
    # TODO: write AuditLog, return updated claim
    return jsonify({'message': 'decide – TODO'}), 501
