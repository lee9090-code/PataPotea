"""
AUTH ROUTES  — owned by: Backend Person 1
Endpoints:
  POST /api/auth/register   — student/staff self-registration
  POST /api/auth/login      — returns JWT access token
  POST /api/auth/logout     — client-side token removal (stateless JWT)
  GET  /api/auth/me         — return current user profile
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..extensions import db
from ..models import User

auth_bp = Blueprint('auth', __name__)


@auth_bp.post('/register')
def register():
    # TODO: validate input (full_name, student_or_staff_number, email, password)
    # TODO: check email and student number are not already registered
    # TODO: enforce email domain (@strathmore.edu) if required
    # TODO: hash password, save user, return 201
    return jsonify({'message': 'register – TODO'}), 501


@auth_bp.post('/login')
def login():
    # TODO: find user by email, check password
    # TODO: reject inactive accounts
    # TODO: update last_active_at
    # TODO: return access_token + user dict
    return jsonify({'message': 'login – TODO'}), 501


@auth_bp.post('/logout')
def logout():
    # JWT is stateless; client discards the token.
    return jsonify({'message': 'Logged out'}), 200


@auth_bp.get('/me')
@jwt_required()
def me():
    # TODO: return User.query.get(get_jwt_identity()).to_dict()
    return jsonify({'message': 'me – TODO'}), 501
