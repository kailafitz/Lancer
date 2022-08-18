from main import app
from main.models import db
import sys

if __name__ == '__main__':
    try:
        db.app = app
        db.init_app(app)
        db.create_all()
        app.debug = True
        app.run()

    except KeyboardInterrupt:
        sys.exit(0)