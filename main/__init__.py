from datetime import datetime, timedelta, timezone
import json
from flask import Flask
from flask_cors import CORS
from flask_marshmallow import Marshmallow
from flask_login import LoginManager
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, JWTManager
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__, static_folder="../frontend/build", static_url_path="/")
app.secret_key = "SUPER_SECRET_KEY"
app.config["JWT_SECRET_KEY"] = "secret-jwt-token"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy()

jwt = JWTManager(app)
login_manager = LoginManager()
login_manager.login_view = "login"
login_manager.init_app(app)
CORS(app, origins="https://kailafitz.pythonanywhere.com",
     allow_headers=["Content-Type", "Authorization",
                    "Access-Control-Allow-Credentials"],
     supports_credentials=True)
ma = Marshmallow(app)

import main.routes


@app.after_request
def refresh_expiring_jwts(response):
    try:
        exp_timestamp = get_jwt()["exp"]
        now = datetime.now(timezone.utc)
        target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
        if target_timestamp > exp_timestamp:
            access_token = create_access_token(identity=get_jwt_identity())
            data = response.get_json()
            if type(data) is dict:
                data["access_token"] = access_token
                response.data = json.dumps(data)
        return response
    except (RuntimeError, KeyError):
        # Case where there is not a valid JWT. Just return the original response
        return response