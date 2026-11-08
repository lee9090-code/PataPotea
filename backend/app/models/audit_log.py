from datetime import datetime, timezone
from ..extensions import db


class AuditLog(db.Model):
    """Append-only. Never update or delete rows from this table."""
    __tablename__ = 'audit_log'

    id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(50), nullable=False)   # e.g. "item_logged", "claim_approved"
    actor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    record_type = db.Column(db.String(20))               # "item" | "claim" | "user"
    record_id = db.Column(db.String(20))                 # PT-0264, CL-0081, etc.
    detail = db.Column(db.Text)                          # JSON snapshot or notes
    timestamp = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    actor = db.relationship('User')

    def to_dict(self):
        return {
            'id': self.id,
            'action': self.action,
            'actorName': self.actor.full_name,
            'actorRole': self.actor.role,
            'recordId': self.record_id,
            'timestamp': self.timestamp.isoformat(),
        }
