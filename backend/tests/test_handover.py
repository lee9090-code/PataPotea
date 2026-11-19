from datetime import date
from app.models import Item, Claim


def make_approved_claim(db, guard, student):
    item = Item(
        reference='PT-0001',
        category='Bags',
        public_description='Navy backpack',
        location_found='Library',
        date_found=date(2026, 11, 3),
        logged_by_id=guard.id,
        status='claim_pending',
    )
    db.session.add(item)
    db.session.commit()

    claim = Claim(
        reference='CL-0001',
        item_id=item.id,
        claimant_id=student.id,
        status='approved',
    )
    db.session.add(claim)
    db.session.commit()
    return item, claim


def test_record_handover_requires_approved_claim(client, db, guard, student, guard_headers):
    item = Item(
        reference='PT-0001',
        category='Bags',
        public_description='Navy backpack',
        location_found='Library',
        date_found=date(2026, 11, 3),
        logged_by_id=guard.id,
    )
    db.session.add(item)
    db.session.commit()
    claim = Claim(reference='CL-0001', item_id=item.id, claimant_id=student.id, status='submitted')
    db.session.add(claim)
    db.session.commit()

    response = client.post(
        f'/api/handover/{claim.id}',
        json={'idChecked': True, 'signatureData': 'data:image/png;base64,xyz'},
        headers=guard_headers,
    )

    assert response.status_code == 400


def test_record_handover_requires_id_check_and_signature(client, db, guard, student, guard_headers):
    item, claim = make_approved_claim(db, guard, student)

    response = client.post(
        f'/api/handover/{claim.id}',
        json={'idChecked': False, 'signatureData': ''},
        headers=guard_headers,
    )

    assert response.status_code == 400


def test_record_handover_marks_claim_and_item_collected(client, db, guard, student, guard_headers):
    item, claim = make_approved_claim(db, guard, student)

    response = client.post(
        f'/api/handover/{claim.id}',
        json={'idChecked': True, 'signatureData': 'data:image/png;base64,xyz'},
        headers=guard_headers,
    )

    assert response.status_code == 201
    body = response.get_json()
    assert body['status'] == 'collected'

    db.session.refresh(item)
    db.session.refresh(claim)
    assert item.status == 'collected'
    assert claim.status == 'collected'
