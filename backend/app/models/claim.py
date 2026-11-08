from datetime import datetime, timezone
from ..extensions import db

# Statuses: submitted | in_review | approved | collected | rejected
CLAIM_STATUSES = ('submitted', 'in_review', 'approved', 'collected', 'rejected')

# Max claim attempts per item per user before locking
MAX_CLAIM_ATTEMPTS = 3


class Claim(db.Model):
    __tablename__ = 'claims'

    id = db.Column(db.Integer, primary_key=True)
    reference = db.Column(db.String(10), unique=True, nullable=False)   # e.g. CL-0081
    item_id = db.Column(db.Integer, db.ForeignKey('items.id'), nullable=False)
    claimant_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='submitted')

    # Claimant's private answers — never shown publicly
    identifying_marks = db.Column(db.Text)
    hidden_details = db.Column(db.Text)
    lost_when_where = db.Column(db.String(200))
    proof_url = db.Column(db.String(255))   # uploaded file path

    # Guard decision
    reviewed_by_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    decision_reason = db.Column(db.Text)    # required for rejection; shown to claimant
    reviewed_at = db.Column(db.DateTime)

    submitted_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    item = db.relationship('Item', back_populates='claims')
    claimant = db.relationship('User', foreign_keys=[claimant_id], back_populates='claims')
    reviewed_by = db.relationship('User', foreign_keys=[reviewed_by_id])
    handover = db.relationship('Handover', back_populates='claim', uselist=False)
