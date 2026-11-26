"""
Creates shared test accounts and sample demo data (found items, lost reports,
claims, a completed handover) so the app has something to look at right after
setup. Safe to run more than once, it skips anything that already exists.

Usage:
    python seed.py
"""
from datetime import date, datetime, timedelta, timezone

from app import create_app
from app.extensions import db
from app.models import User, Item, Claim, Handover, LostReport
from app.utils.helpers import next_reference

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
    dict(
        full_name='Student Account',
        student_or_staff_number='STU0001',
        email='student@patapotea.test',
        password='Student123!',
        role='student',
    ),
]

SAMPLE_ITEMS = [
    dict(
        category='Electronics',
        public_description='Silver laptop, 13-inch, no visible stickers',
        location_found='Library, second floor',
        date_found=date.today() - timedelta(days=1),
        private_details='Dell logo on the lid, small dent on the back right corner',
        finder_name='Campus Security',
        finder_contact='security@strathmore.edu',
        status='in_store',
    ),
    dict(
        category='Bottles',
        public_description='Blue stainless steel water bottle',
        location_found='Sports complex',
        date_found=date.today() - timedelta(days=3),
        private_details='Dented base, strap wrapped around the neck',
        finder_name='Campus Security',
        finder_contact='security@strathmore.edu',
        status='in_store',
    ),
    dict(
        category='Documents',
        public_description='Strathmore student ID card',
        location_found='Main cafeteria',
        date_found=date.today() - timedelta(days=5),
        private_details='Card held together with the lanyard still attached',
        finder_name='Campus Security',
        finder_contact='security@strathmore.edu',
        status='in_store',
    ),
    dict(
        category='Bags',
        public_description='Black backpack with a laptop sleeve',
        location_found='Lecture theatre 3',
        date_found=date.today() - timedelta(days=10),
        private_details='Front pocket has a broken zipper pull',
        finder_name='Campus Security',
        finder_contact='security@strathmore.edu',
        status='collected',
    ),
]

SAMPLE_LOST_REPORTS = [
    dict(
        category='Keys',
        description='Bunch of keys with a red keychain, one car key and two door keys',
        location_lost='Parking lot B',
        date_lost=date.today() - timedelta(days=2),
    ),
    dict(
        category='Accessories',
        description='Prescription glasses in a black hard case',
        location_lost='Chemistry lab',
        date_lost=date.today() - timedelta(days=4),
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

    guard = User.query.filter_by(email='guard@patapotea.test').first()
    student = User.query.filter_by(email='student@patapotea.test').first()

    if Item.query.count() == 0:
        created_items = []

        for sample in SAMPLE_ITEMS:
            item = Item(
                reference=next_reference('PT', Item, 'reference'),
                category=sample['category'],
                public_description=sample['public_description'],
                location_found=sample['location_found'],
                date_found=sample['date_found'],
                private_details=sample['private_details'],
                finder_name=sample['finder_name'],
                finder_contact=sample['finder_contact'],
                status=sample['status'],
                logged_by_id=guard.id,
            )
            db.session.add(item)
            db.session.commit()
            created_items.append(item)
            print(f"Created sample item: {item.reference} ({item.category})")

        # A fully collected example: student claim, guard approval, handover.
        collected_item = created_items[-1]
        claim = Claim(
            reference=next_reference('CL', Claim, 'reference'),
            item_id=collected_item.id,
            claimant_id=student.id,
            status='collected',
            identifying_marks='Initials "JM" written inside the laptop sleeve',
            hidden_details='Keeps a spare charger in the front pocket',
            lost_when_where=f"{collected_item.date_found.isoformat()}, {collected_item.location_found}",
            reviewed_by_id=guard.id,
            decision_reason='Details matched, proof of ownership confirmed',
            reviewed_at=datetime.now(timezone.utc) - timedelta(days=2),
            submitted_at=datetime.now(timezone.utc) - timedelta(days=3),
        )
        db.session.add(claim)
        db.session.commit()

        handover = Handover(
            claim_id=claim.id,
            guard_id=guard.id,
            id_checked=True,
            collected_at=datetime.now(timezone.utc) - timedelta(days=1),
        )
        db.session.add(handover)
        db.session.commit()
        print(f"Created sample claim {claim.reference} with a completed handover")

        # A second claim still awaiting guard review, so the guard dashboard
        # has something pending to show.
        pending_item = created_items[0]
        pending_claim = Claim(
            reference=next_reference('CL', Claim, 'reference'),
            item_id=pending_item.id,
            claimant_id=student.id,
            status='submitted',
            identifying_marks='Sticker residue near the trackpad from a removed logo',
            hidden_details='Wallpaper is a photo of Mount Kenya',
            lost_when_where=f"{pending_item.date_found.isoformat()}, {pending_item.location_found}",
        )
        db.session.add(pending_claim)
        db.session.commit()
        print(f"Created sample pending claim: {pending_claim.reference}")
    else:
        print("Items already exist, skipped sample items and claims")

    if LostReport.query.count() == 0:
        for sample in SAMPLE_LOST_REPORTS:
            report = LostReport(
                reference=next_reference('LR', LostReport, 'reference'),
                category=sample['category'],
                description=sample['description'],
                location_lost=sample['location_lost'],
                date_lost=sample['date_lost'],
                reporter_id=student.id,
            )
            db.session.add(report)
            db.session.commit()
            print(f"Created sample lost report: {report.reference}")
    else:
        print("Lost reports already exist, skipped sample lost reports")
