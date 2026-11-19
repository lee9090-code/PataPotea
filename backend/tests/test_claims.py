from datetime import date
from app.models import Item, Claim


def make_item(db, guard, status='in_store', **overrides):
    defaults = dict(
        reference='PT-0001',
        category='Bags',
        public_description='Navy backpack',
        location_found='Library',
        date_found=date(2026, 11, 3),
        logged_by_id=guard.id,
        private_details='initials AW on the inner label',
        status=status,
    )
    defaults.update(overrides)
    item = Item(**defaults)
    db.session.add(item)
    db.session.commit()
    return item


def test_submit_claim_moves_item_to_claim_pending(client, db, guard, student, student_headers):
    item = make_item(db, guard)

    response = client.post(
        '/api/claims/',
        data={
            'itemId': str(item.id),
            'identifyingMarks': 'AW on the label',
            'hiddenDetails': 'blue keyring inside',
            'lostWhenWhere': '03 Nov, Library',
        },
        headers=student_headers,
    )

    assert response.status_code == 201
    assert response.get_json()['status'] == 'submitted'
    db.session.refresh(item)
    assert item.status == 'claim_pending'


def test_submit_claim_rejected_when_item_not_in_store(client, db, guard, student_headers):
    item = make_item(db, guard, status='claim_pending')

    response = client.post(
        '/api/claims/',
        data={'itemId': str(item.id)},
        headers=student_headers,
    )

    assert response.status_code == 400


def test_submit_claim_enforces_max_attempts(client, db, guard, student, student_headers):
    item = make_item(db, guard)

    for i in range(3):
        claim = Claim(
            reference=f'CL-000{i}',
            item_id=item.id,
            claimant_id=student.id,
        )
        db.session.add(claim)
    db.session.commit()

    response = client.post(
        '/api/claims/',
        data={'itemId': str(item.id)},
        headers=student_headers,
    )

    assert response.status_code == 400


def test_my_claims_only_returns_own_claims(client, db, guard, student, admin, student_headers):
    item = make_item(db, guard)
    own = Claim(reference='CL-0001', item_id=item.id, claimant_id=student.id)
    other = Claim(reference='CL-0002', item_id=item.id, claimant_id=admin.id)
    db.session.add_all([own, other])
    db.session.commit()

    response = client.get('/api/claims/mine', headers=student_headers)

    body = response.get_json()
    assert len(body) == 1
    assert body[0]['reference'] == 'CL-0001'


def test_get_claim_shows_claimant_and_item_private_details(client, db, guard, student, guard_headers):
    item = make_item(db, guard)
    claim = Claim(
        reference='CL-0001',
        item_id=item.id,
        claimant_id=student.id,
        identifying_marks='AW on the label',
        hidden_details='blue keyring inside',
    )
    db.session.add(claim)
    db.session.commit()

    response = client.get(f'/api/claims/{claim.id}', headers=guard_headers)

    body = response.get_json()
    assert body['claimantAnswers']['identifyingMarks'] == 'AW on the label'
    assert body['itemRecord']['privateDetails'] == 'initials AW on the inner label'


def test_decide_approve_requires_no_reason(client, db, guard, student, guard_headers):
    item = make_item(db, guard, status='claim_pending')
    claim = Claim(reference='CL-0001', item_id=item.id, claimant_id=student.id)
    db.session.add(claim)
    db.session.commit()

    response = client.patch(
        f'/api/claims/{claim.id}/decision',
        json={'decision': 'approved'},
        headers=guard_headers,
    )

    assert response.status_code == 200
    assert response.get_json()['status'] == 'approved'


def test_decide_reject_requires_reason(client, db, guard, student, guard_headers):
    item = make_item(db, guard, status='claim_pending')
    claim = Claim(reference='CL-0001', item_id=item.id, claimant_id=student.id)
    db.session.add(claim)
    db.session.commit()

    response = client.patch(
        f'/api/claims/{claim.id}/decision',
        json={'decision': 'rejected'},
        headers=guard_headers,
    )

    assert response.status_code == 400


def test_decide_reject_frees_item_back_to_in_store(client, db, guard, student, guard_headers):
    item = make_item(db, guard, status='claim_pending')
    claim = Claim(reference='CL-0001', item_id=item.id, claimant_id=student.id)
    db.session.add(claim)
    db.session.commit()

    response = client.patch(
        f'/api/claims/{claim.id}/decision',
        json={'decision': 'rejected', 'reason': 'Details did not match'},
        headers=guard_headers,
    )

    assert response.status_code == 200
    db.session.refresh(item)
    assert item.status == 'in_store'
