import os
from flask import Flask
from dotenv import load_dotenv

from .config import config
from .extensions import db, migrate, jwt, cors

load_dotenv()


def create_app(config_name: str = None) -> Flask:
    app = Flask(__name__)

    cfg = config_name or os.getenv('FLASK_ENV', 'development')
    app.config.from_object(config[cfg])

    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r'/api/*': {'origins': '*'}})

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.items import items_bp
    from .routes.claims import claims_bp
    from .routes.handover import handover_bp
    from .routes.admin import admin_bp

    app.register_blueprint(auth_bp,     url_prefix='/api/auth')
    app.register_blueprint(items_bp,    url_prefix='/api/items')
    app.register_blueprint(claims_bp,   url_prefix='/api/claims')
    app.register_blueprint(handover_bp, url_prefix='/api/handover')
    app.register_blueprint(admin_bp,    url_prefix='/api/admin')

    return app
