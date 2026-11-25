def submit_report(client, headers, **overrides):
    defaults = dict(
        category='Bags',
        description='Navy blue backpack with a front zip pocket',
        locationLost='Library',
        dateLost='2026-11-20',
    )
    defaults.update(overrides)
    return client.post('/api/lost-reports/', json=defaults, headers=headers)


def test_submit_lost_report_requires_login(client):
    response = client.post('/api/lost-reports/', json={
        'category': 'Bags',
        'description': 'Navy backpack',
        'dateLost': '2026-11-20',
    })

    assert response.status_code == 401


def test_submit_lost_report_creates_record(client, student_headers):
    response = submit_report(client, student_headers)

    assert response.status_code == 201
    body = response.get_json()
    assert body['status'] == 'open'
    assert body['reference'].startswith('LR-')
    assert body['category'] == 'Bags'


def test_submit_lost_report_rejects_missing_description(client, student_headers):
    response = submit_report(client, student_headers, description='')

    assert response.status_code == 400


def test_submit_lost_report_rejects_bad_date(client, student_headers):
    response = submit_report(client, student_headers, dateLost='20 Nov 2026')

    assert response.status_code == 400


def test_my_lost_reports_only_returns_own(client, db, student, admin, student_headers, admin_headers):
    submit_report(client, student_headers)
    submit_report(client, admin_headers, category='Bottles', description='Green water bottle', dateLost='2026-11-21')

    response = client.get('/api/lost-reports/mine', headers=student_headers)

    assert response.status_code == 200
    body = response.get_json()
    assert len(body) == 1
    assert body[0]['category'] == 'Bags'


def test_list_lost_reports_requires_guard_or_admin(client, student_headers):
    response = client.get('/api/lost-reports/', headers=student_headers)

    assert response.status_code == 403


def test_list_lost_reports_shows_reporter_details(client, student, student_headers, guard_headers):
    submit_report(client, student_headers)

    response = client.get('/api/lost-reports/', headers=guard_headers)

    assert response.status_code == 200
    body = response.get_json()
    assert len(body) == 1
    assert body[0]['reporterName'] == student.full_name
