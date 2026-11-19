import pytest
from flask_jwt_extended import create_access_token

from app import create_app
from app.extensions import db as _db
from app.models import User


@pytest.fixture
def app():
    app = create_app('testing')
    with app.app_context():
        _db.create_all()
        yield app
        _db.drop_all()


@pytest.fixture
def db(app):
    return _db


@pytest.fixture
def client(app):
    return app.test_client()


def make_user(db, role='student', number='1', email=None):
    user = User(
        full_name=f'Test {role}',
        student_or_staff_number=number,
        email=email or f'{role}{number}@strathmore.edu',
        role=role,
    )
    user.set_password('password123')
    db.session.add(user)
    db.session.commit()
    return user


def auth_header(app, user):
    with app.app_context():
        token = create_access_token(identity=str(user.id))
    return {'Authorization': f'Bearer {token}'}


@pytest.fixture
def student(db):
    return make_user(db, role='student', number='1001')


@pytest.fixture
def guard(db):
    return make_user(db, role='guard', number='2001')


@pytest.fixture
def admin(db):
    return make_user(db, role='admin', number='3001')


@pytest.fixture
def student_headers(app, student):
    return auth_header(app, student)


@pytest.fixture
def guard_headers(app, guard):
    return auth_header(app, guard)


@pytest.fixture
def admin_headers(app, admin):
    return auth_header(app, admin)
