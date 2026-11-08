from datetime import datetime, timezone
from ..extensions import db


class Handover(db.Model):
    __tablename__ = 'handovers'

    id = db.Column(db.Integer, primary_key=True)
    claim_id = db.Column(db.Integer, db.ForeignKey('claims.id'), unique=True, nullable=False)
    guard_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    id_checked = db.Column(db.Boolean, nullable=False, default=False)
    signature_data = db.Column(db.Text)     # base64-encoded canvas PNG
    collected_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    claim = db.relationship('Claim', back_populates='handover')
    guard = db.relationship('User')
