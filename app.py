from main import app, db

db.app = app
db.init_app(app)
db.create_all()
app.debug = True
app.run()