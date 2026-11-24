def register(client, **overrides):
    defaults = dict(
        fullName='Test Student',
        studentOrStaffNumber='1001',
        email='teststudent@strathmore.edu',
        password='password123',
    )
    defaults.update(overrides)
    return client.post('/api/auth/register', json=defaults)


def test_register_creates_student_account(client, db):
    response = register(client)

    assert response.status_code == 201
    body = response.get_json()
    assert body['user']['role'] == 'student'
    assert body['user']['email'] == 'teststudent@strathmore.edu'


def test_register_rejects_missing_field(client):
    response = register(client, password='')

    assert response.status_code == 400


def test_register_rejects_short_password(client):
    response = register(client, password='short')

    assert response.status_code == 400


def test_register_rejects_invalid_email(client):
    response = register(client, email='not-an-email')

    assert response.status_code == 400


def test_register_rejects_duplicate_email(client, db):
    register(client)

    response = register(client, studentOrStaffNumber='9999')

    assert response.status_code == 409


def test_register_rejects_duplicate_student_number(client, db):
    register(client)

    response = register(client, email='other@strathmore.edu')

    assert response.status_code == 409


def test_login_succeeds_with_correct_credentials(client, db):
    register(client)

    response = client.post('/api/auth/login', json={
        'email': 'teststudent@strathmore.edu',
        'password': 'password123',
    })

    assert response.status_code == 200
    body = response.get_json()
    assert 'access_token' in body
    assert body['user']['email'] == 'teststudent@strathmore.edu'


def test_login_rejects_wrong_password(client, db):
    register(client)

    response = client.post('/api/auth/login', json={
        'email': 'teststudent@strathmore.edu',
        'password': 'wrongpassword',
    })

    assert response.status_code == 401


def test_login_rejects_unknown_email(client, db):
    response = client.post('/api/auth/login', json={
        'email': 'nobody@strathmore.edu',
        'password': 'password123',
    })

    assert response.status_code == 401


def test_login_rejects_deactivated_account(client, db, guard):
    guard.is_active = False
    db.session.commit()

    response = client.post('/api/auth/login', json={
        'email': guard.email,
        'password': 'password123',
    })

    assert response.status_code == 403


def test_me_returns_current_user(client, db, student, student_headers):
    response = client.get('/api/auth/me', headers=student_headers)

    assert response.status_code == 200
    assert response.get_json()['user']['id'] == student.id


def test_me_rejects_missing_token(client):
    response = client.get('/api/auth/me')

    assert response.status_code == 401


def test_logout_requires_valid_token(client, student_headers):
    response = client.post('/api/auth/logout', headers=student_headers)

    assert response.status_code == 200
