from datetime import datetime, timezone
from ..extensions import db

# Statuses: open | matched | closed
LOST_REPORT_STATUSES = ('open', 'matched', 'closed')


class LostReport(db.Model):
    __tablename__ = 'lost_reports'

    id = db.Column(db.Integer, primary_key=True)
    reference = db.Column(db.String(10), unique=True, nullable=False)   # e.g. LR-0001
    category = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location_lost = db.Column(db.String(120))
    date_lost = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='open')

    reporter_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    reported_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    reporter = db.relationship('User')

    def to_dict(self):
        return {
            'id': self.id,
            'reference': self.reference,
            'category': self.category,
            'description': self.description,
            'locationLost': self.location_lost,
            'dateLost': self.date_lost.isoformat(),
            'status': self.status,
            'reportedAt': self.reported_at.isoformat() if self.reported_at else None,
        }

    def to_guard_dict(self):
        return {
            **self.to_dict(),
            'reporterName': self.reporter.full_name,
            'reporterEmail': self.reporter.email,
        }
