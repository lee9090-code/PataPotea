"""
Creates the shared guard and admin test accounts used by the whole team.
Safe to run more than once, it skips any account that already exists.

Usage:
    python seed.py
"""
from app import create_app
from app.extensions import db
from app.models import User

app = create_app()

ACCOUNTS = [
    dict(
        full_name='Guard Account',
        student_or_staff_number='GUARD001',
        email='guard@patapotea.test',
        password='Guard123!',
        role='guard',
    ),
    dict(
        full_name='Admin Account',
        student_or_staff_number='ADMIN001',
        email='admin@patapotea.test',
        password='Admin123!',
        role='admin',
    ),
]

with app.app_context():
    for account in ACCOUNTS:
        existing = User.query.filter_by(email=account['email']).first()

        if existing:
            print(f"Already exists, skipped: {account['email']}")
            continue

        user = User(
            full_name=account['full_name'],
            student_or_staff_number=account['student_or_staff_number'],
            email=account['email'],
            role=account['role'],
            is_active=True,
        )
        user.set_password(account['password'])
        db.session.add(user)
        db.session.commit()
        print(f"Created {account['role']} account: {account['email']}")
