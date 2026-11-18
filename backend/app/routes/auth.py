
"""
AUTH ROUTES — Backend Person 1

Endpoints:
  POST /api/auth/register
  POST /api/auth/login
  POST /api/auth/logout
  GET  /api/auth/me
"""

from datetime import datetime, timezone

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from sqlalchemy.exc import IntegrityError

from ..extensions import db
from ..models import User


auth_bp = Blueprint('auth', __name__)


# --------------------------------------------------
# REGISTER
# --------------------------------------------------

@auth_bp.post('/register')
def register():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({'error': 'Request body must be valid JSON'}), 400

    full_name = data.get('fullName', '').strip()
    student_number = data.get('studentOrStaffNumber', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not all([full_name, student_number, email, password]):
        return jsonify({'error': 'All fields are required'}), 400

    if not isinstance(password, str):
        return jsonify({'error': 'Password must be a string'}), 400

    if len(full_name) > 120 or len(student_number) > 20 or len(email) > 120:
        return jsonify({'error': 'One or more fields exceed the allowed length'}), 400

    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400

    if '@' not in email or email.startswith('@') or email.endswith('@'):
        return jsonify({'error': 'Please provide a valid email address'}), 400

    existing_user = User.query.filter(
        (User.email == email) |
        (User.student_or_staff_number == student_number)
    ).first()

    if existing_user:
        return jsonify({
            'error': 'Email or student/staff number is already registered'
        }), 409

    user = User(
        full_name=full_name,
        student_or_staff_number=student_number,
        email=email,
        role='student',
        is_active=True
    )

    user.set_password(password)

    try:
        db.session.add(user)
        db.session.commit()

    except IntegrityError:
        db.session.rollback()
        return jsonify({
            'error': 'Email or student/staff number is already registered'
        }), 409

    return jsonify({
        'message': 'Registration successful',
        'user': user.to_dict()
    }), 201


# --------------------------------------------------
# LOGIN
# --------------------------------------------------

@auth_bp.post('/login')
def login():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({'error': 'Request body must be valid JSON'}), 400

    email = data.get('email', '')
    password = data.get('password', '')

    if not isinstance(email, str) or not isinstance(password, str):
        return jsonify({'error': 'Invalid email or password'}), 400

    email = email.strip().lower()

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401

    if not user.is_active:
        return jsonify({'error': 'Your account has been deactivated'}), 403

    user.last_active_at = datetime.now(timezone.utc)

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Login could not be completed'}), 500

    access_token = create_access_token(
        identity=str(user.id)
    )

    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': user.to_dict()
    }), 200


# --------------------------------------------------
# LOGOUT
# --------------------------------------------------

@auth_bp.post('/logout')
@jwt_required()
def logout():
    # Stateless JWT: the client must discard its access token.
    # Server-side token revocation can be added later.

    return jsonify({
        'message': 'Logged out successfully'
    }), 200


# --------------------------------------------------
# CURRENT USER PROFILE
# --------------------------------------------------

@auth_bp.get('/me')
@jwt_required()
def me():
    user_id = get_jwt_identity()

    try:
        user = db.session.get(User, int(user_id))
    except (ValueError, TypeError):
        user = None

    if not user or not user.is_active:
        return jsonify({
            'error': 'Account not found or inactive'
        }), 403

    return jsonify({
        'user': user.to_dict()
    }), 200
