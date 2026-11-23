from datetime import date
from app.models import Item


def log_item(db, guard, **overrides):
    defaults = dict(
        reference='PT-0001',
        category='Bags',
        public_description='Navy backpack',
        location_found='Library',
        date_found=date(2026, 11, 3),
        logged_by_id=guard.id,
    )
    defaults.update(overrides)
    item = Item(**defaults)
    db.session.add(item)
    db.session.commit()
    return item


def test_list_items_returns_only_public_fields(client, db, guard):
    log_item(db, guard, private_details='serial 123')

    response = client.get('/api/items/')

    assert response.status_code == 200
    body = response.get_json()
    assert len(body) == 1
    assert body[0]['publicDescription'] == 'Navy backpack'
    assert 'private_details' not in body[0]
    assert 'privateDetails' not in body[0]


def test_list_items_search_filters_by_description(client, db, guard):
    log_item(db, guard, reference='PT-0001', public_description='Navy backpack')
    log_item(db, guard, reference='PT-0002', public_description='Green water bottle')

    response = client.get('/api/items/?q=backpack')

    body = response.get_json()
    assert len(body) == 1
    assert body[0]['reference'] == 'PT-0001'


def test_get_item_404_when_missing(client, db):
    response = client.get('/api/items/999')
    assert response.status_code == 404


def test_log_item_requires_guard_role(client, student_headers):
    response = client.post(
        '/api/items/',
        data={
            'category': 'Bags',
            'publicDescription': 'Navy backpack',
            'locationFound': 'Library',
            'dateFound': '2026-11-03',
        },
        headers=student_headers,
    )
    assert response.status_code == 403


def test_log_item_creates_item_as_guard(client, guard_headers):
    response = client.post(
        '/api/items/',
        data={
            'category': 'Bags',
            'publicDescription': 'Navy backpack',
            'locationFound': 'Library',
            'dateFound': '2026-11-03',
        },
        headers=guard_headers,
    )

    assert response.status_code == 201
    body = response.get_json()
    assert body['publicDescription'] == 'Navy backpack'
    assert body['status'] == 'in_store'
    assert body['reference'].startswith('PT-')


def test_log_item_rejects_missing_required_field(client, guard_headers):
    response = client.post(
        '/api/items/',
        data={
            'category': 'Bags',
            'locationFound': 'Library',
            'dateFound': '2026-11-03',
        },
        headers=guard_headers,
    )
    assert response.status_code == 400


def test_update_status_as_admin(client, db, guard, admin_headers):
    item = log_item(db, guard)

    response = client.patch(
        f'/api/items/{item.id}/status',
        json={'status': 'unclaimed'},
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert response.get_json()['status'] == 'unclaimed'


def test_update_status_rejects_invalid_value(client, db, guard, admin_headers):
    item = log_item(db, guard)

    response = client.patch(
        f'/api/items/{item.id}/status',
        json={'status': 'not_a_real_status'},
        headers=admin_headers,
    )

    assert response.status_code == 400
