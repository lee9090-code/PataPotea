from datetime import datetime, timezone
from ..extensions import db

# Statuses: in_store | claim_pending | approved | collected | unclaimed
ITEM_STATUSES = ('in_store', 'claim_pending', 'approved', 'collected', 'unclaimed')


class Item(db.Model):
    __tablename__ = 'items'

    id = db.Column(db.Integer, primary_key=True)
    reference = db.Column(db.String(10), unique=True, nullable=False)   # e.g. PT-0264
    category = db.Column(db.String(50), nullable=False)
    public_description = db.Column(db.Text, nullable=False)
    location_found = db.Column(db.String(120), nullable=False)
    date_found = db.Column(db.Date, nullable=False)
    time_found = db.Column(db.Time)
    image_url = db.Column(db.String(255))
    status = db.Column(db.String(20), nullable=False, default='in_store')

    # Private — visible to guard/admin only
    private_details = db.Column(db.Text)
    finder_name = db.Column(db.String(120))
    finder_contact = db.Column(db.String(120))

    logged_by_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    logged_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    claims = db.relationship('Claim', back_populates='item', lazy='dynamic')

    def to_public_dict(self):
        return {
            'id': self.id,
            'reference': self.reference,
            'category': self.category,
            'publicDescription': self.public_description,
            'locationFound': self.location_found,
            'dateFound': self.date_found.isoformat(),
            'status': self.status,
            'imageUrl': self.image_url,
        }
