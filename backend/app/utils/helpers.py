import os
import uuid
from flask import current_app
from werkzeug.utils import secure_filename


def allowed_file(filename: str, allowed_extensions: set) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions


def save_upload(file, subfolder: str, allowed_extensions: set) -> str | None:
    """Save an uploaded file and return its relative URL path, or None if invalid."""
    if not file or file.filename == '':
        return None
    if not allowed_file(file.filename, allowed_extensions):
        return None

    ext = file.filename.rsplit('.', 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    folder = os.path.join(current_app.config['UPLOAD_FOLDER'], subfolder)
    os.makedirs(folder, exist_ok=True)
    file.save(os.path.join(folder, unique_name))
    return f"/uploads/{subfolder}/{unique_name}"


def next_reference(prefix: str, model, field: str) -> str:
    """Generate the next sequential reference, e.g. PT-0265."""
    from ..extensions import db
    last = db.session.query(model).order_by(db.text(f'{field} DESC')).first()
    if last:
        num = int(getattr(last, field).split('-')[1]) + 1
    else:
        num = 1
    return f"{prefix}-{num:04d}"
