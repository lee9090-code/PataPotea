from datetime import date
from app.models import Item


def log_item(db, logger, **overrides):
    defaults = dict(
        reference='PT-0001',
        category='Bags',
        public_description='Navy backpack',
        location_found='Library',
        date_found=date(2026, 11, 3),
        logged_by_id=logger.id,
    )
    defaults.update(overrides)
    item = Item(**defaults)
    db.session.add(item)
    db.session.commit()
    return item


def test_stats_requires_admin_role(client, guard_headers):
    response = client.get('/api/admin/stats', headers=guard_headers)

    assert response.status_code == 403


def test_stats_returns_counts_and_weekly_breakdown(client, db, guard, admin_headers):
    log_item(db, guard, reference='PT-0001', status='collected')
    log_item(db, guard, reference='PT-0002', status='unclaimed')

    response = client.get('/api/admin/stats', headers=admin_headers)

    assert response.status_code == 200
    body = response.get_json()
    assert body['itemsLogged'] == 2
    assert body['itemsCollected'] == 1
    assert body['unclaimedItems'] == 1
    assert len(body['weeklyBreakdown']) == 6
    assert sum(week['itemsLogged'] for week in body['weeklyBreakdown']) == 2


def test_list_users_requires_admin_role(client, student_headers):
    response = client.get('/api/admin/users', headers=student_headers)

    assert response.status_code == 403


def test_list_users_returns_every_role(client, db, student, guard, admin, admin_headers):
    response = client.get('/api/admin/users', headers=admin_headers)

    assert response.status_code == 200
    body = response.get_json()
    roles = {user['role'] for user in body}
    assert roles == {'student', 'guard', 'admin'}
    assert all('lastActiveAt' in user for user in body)


def test_list_users_filters_by_role(client, db, student, guard, admin, admin_headers):
    response = client.get(
        '/api/admin/users',
        query_string={'role': 'student'},
        headers=admin_headers,
    )

    body = response.get_json()
    assert len(body) == 1
    assert body[0]['role'] == 'student'


def test_list_users_filters_by_search(client, db, student, guard, admin, admin_headers):
    response = client.get(
        '/api/admin/users',
        query_string={'search': student.email},
        headers=admin_headers,
    )

    body = response.get_json()
    assert len(body) == 1
    assert body[0]['id'] == student.id


def test_list_guards_requires_admin_role(client, student_headers):
    response = client.get('/api/admin/guards', headers=student_headers)

    assert response.status_code == 403


def test_list_guards_as_admin(client, db, guard, admin_headers):
    response = client.get('/api/admin/guards', headers=admin_headers)

    assert response.status_code == 200
    body = response.get_json()
    assert len(body) == 1
    assert body[0]['isActive'] is True


def test_add_guard_creates_account(client, db, admin_headers):
    response = client.post(
        '/api/admin/guards',
        json={'fullName': 'New Guard', 'email': 'newguard@strathmore.edu'},
        headers=admin_headers,
    )

    assert response.status_code == 201
    body = response.get_json()
    assert body['guard']['role'] == 'guard'
    assert 'temporaryPassword' in body


def test_add_guard_rejects_duplicate_email(client, db, guard, admin_headers):
    response = client.post(
        '/api/admin/guards',
        json={'fullName': 'Duplicate Guard', 'email': guard.email},
        headers=admin_headers,
    )

    assert response.status_code == 409


def test_add_guard_rejects_missing_fields(client, admin_headers):
    response = client.post(
        '/api/admin/guards',
        json={'fullName': 'No Email'},
        headers=admin_headers,
    )

    assert response.status_code == 400


def test_edit_guard_updates_name_and_email(client, db, guard, admin_headers):
    response = client.patch(
        f'/api/admin/guards/{guard.id}',
        json={'fullName': 'Updated Name', 'email': 'updated@strathmore.edu'},
        headers=admin_headers,
    )

    assert response.status_code == 200
    assert response.get_json()['guard']['fullName'] == 'Updated Name'


def test_edit_guard_404_when_not_a_guard(client, db, student, admin_headers):
    response = client.patch(
        f'/api/admin/guards/{student.id}',
        json={'fullName': 'Should not work', 'email': 'x@strathmore.edu'},
        headers=admin_headers,
    )

    assert response.status_code == 404


def test_deactivate_guard_sets_inactive(client, db, guard, admin_headers):
    response = client.patch(
        f'/api/admin/guards/{guard.id}/deactivate',
        headers=admin_headers,
    )

    assert response.status_code == 200
    db.session.refresh(guard)
    assert guard.is_active is False


def test_activate_guard_sets_active(client, db, guard, admin_headers):
    guard.is_active = False
    db.session.commit()

    response = client.patch(
        f'/api/admin/guards/{guard.id}/activate',
        headers=admin_headers,
    )

    assert response.status_code == 200
    db.session.refresh(guard)
    assert guard.is_active is True


def test_items_and_claims_requires_admin_role(client, guard_headers):
    response = client.get('/api/admin/items-claims', headers=guard_headers)

    assert response.status_code == 403


def test_items_and_claims_lists_items_tab(client, db, guard, admin_headers):
    log_item(db, guard)

    response = client.get(
        '/api/admin/items-claims',
        query_string={'tab': 'items'},
        headers=admin_headers,
    )

    assert response.status_code == 200
    body = response.get_json()
    assert body['tab'] == 'items'
    assert len(body['data']) == 1
    assert body['data'][0]['reference'] == 'PT-0001'


def test_items_and_claims_rejects_invalid_tab(client, admin_headers):
    response = client.get(
        '/api/admin/items-claims',
        query_string={'tab': 'bogus'},
        headers=admin_headers,
    )

    assert response.status_code == 400


def test_audit_log_requires_admin_role(client, student_headers):
    response = client.get('/api/admin/audit-log', headers=student_headers)

    assert response.status_code == 403


def test_audit_log_records_guard_creation(client, db, admin_headers):
    client.post(
        '/api/admin/guards',
        json={'fullName': 'Logged Guard', 'email': 'logged@strathmore.edu'},
        headers=admin_headers,
    )

    response = client.get('/api/admin/audit-log', headers=admin_headers)

    assert response.status_code == 200
    body = response.get_json()
    assert len(body['data']) == 1
    assert body['data'][0]['action'] == 'guard_added'
