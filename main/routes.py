from main import app
from crypt import methods
from curses.ascii import US
from datetime import datetime

from flask import jsonify, request
from flask.helpers import send_from_directory
from flask_jwt_extended import create_access_token, get_jwt, get_jwt_identity, jwt_required, unset_jwt_cookies
from sqlalchemy import extract
from main.schema import JobSchema, UsersSchema, BankAccountSchema, UserAddressSchema, EmployerSchema
from main.models import Job, User, BankAccount, UserAddress, Employer, db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import cross_origin
from datetime import datetime, timedelta, timezone
from dateutil.parser import *

jobs_schema = JobSchema(many=True)
job_schema = JobSchema()
users_schema = UsersSchema(many=True)
user_schema = UsersSchema()
bank_account_schema = BankAccountSchema()
user_address_schema = UserAddressSchema()
employers_schema = EmployerSchema(many=True)
employer_schema = EmployerSchema()

@app.route('/')
def serve():
    return send_from_directory(app.static_folder, "index.html")

@app.errorhandler(404)   
def not_found(e):   
  return app.send_static_file("index.html")

@app.route("/api/active")
@jwt_required()
def active():
    exp_timestamp = get_jwt()["exp"]
    now = datetime.now(timezone.utc)
    target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
    if target_timestamp > exp_timestamp:
        return "invalid token", 400
    else:
        return "valid token", 200


@app.route("/api/records/active")
@jwt_required()
def active2():
    exp_timestamp = get_jwt()["exp"]
    now = datetime.now(timezone.utc)
    target_timestamp = datetime.timestamp(now + timedelta(minutes=30))
    if target_timestamp > exp_timestamp:
        return "invalid token", 400
    else:
        return "valid token", 200


@app.route("/api/register", methods=["POST"])
@cross_origin(methods=["POST"], supports_credentials=True, headers=["Content-Type", "Authorization"], origin="https://kailafitz.pythonanywhere.com/")
def register():
    data = request.get_json()
    username = data["username"]
    email = data["email"]
    password = data["password"]
    confirm_password = data["confirm_password"]
    first_name = data["first_name"]
    last_name = data["last_name"]
    bic = data["bic"]
    iban = data["iban"]
    vat_number = data["vat_number"]
    line_1 = data["line_1"]
    line_2 = data["line_2"]
    town = data["town"]
    region = data["region"]
    country = data["country"]

    if not username or not email or not password or not confirm_password or not first_name or not last_name or not bic or not iban or not vat_number or not line_1 or not line_2 or not town or not region or not country:
        return {"message": "Values must not be empty"}, 400

    user_email = User.query.filter_by(email=email).first()
    if user_email:
        return {"message": "Email is already in use"}, 400


    user = User.query.filter_by(username=username).first()
    if user is None:
        if password == confirm_password:
            hashed_password = generate_password_hash(password, "sha256")
            new_user = User(username=username, email=email,
                            password=hashed_password, vat_number=vat_number)
            bank_account = BankAccount(
                first_name=first_name, last_name=last_name, bic=bic, iban=iban, username=username)
            user_address = UserAddress(
                line_1=line_1, line_2=line_2, town=town, region=region, country=country, username=username)
            db.session.add(new_user)
            db.session.add(bank_account)
            db.session.add(user_address)
            db.session.commit()
            access_token = create_access_token(identity=username)
            response = {"access_token": access_token}
            return response, 200
        else:
            return {"message": "Passwords are not matching"}, 400
    else:
        return {"message": "Username is already in use"}, 400


@app.route("/api/login", methods=["POST"])
@cross_origin(methods=["POST"], supports_credentials=True, headers=["Content-Type", "Authorization"], origin="https://kailafitz.pythonanywhere.com/")
def login():
    data = request.get_json()
    username = data["username"]
    password = data["password"]

    if not username or not password:
        return {"message": "Values must not be empty"}, 400

    user = User.query.filter_by(username=username).first()
    if user is None:
        return {"message": "User does not exist"}, 401
    else:
        if check_password_hash(user.password, password):
            access_token = create_access_token(identity=username)
            response = {"access_token": access_token, "message": "Success"}
            return response, 200
        else:
            return {"message": "Incorrect password"}, 401


@app.route("/api/dashboard", methods=["GET", "POST"])
@cross_origin(methods=["GET", "POST"], headers=["Content-Type", "Authorization"], origin="https://kailafitz.pythonanywhere.com/")
@jwt_required()
def dashboard():
    username_of_logged_in_user = get_jwt_identity()
    user = User.query.filter_by(
        username=username_of_logged_in_user).first()

    gross_pay = 0
    tax_due = 0
    net_pay = 0

    if not user:
        return {"message": "Not found"}, 404

    if request.method == "POST":
        data = request.get_json()
        year = data["year"]

        jobs = Job.query.filter(extract("year", Job.date_created)
                                == year, Job.user_id == user.id).all()

        serialised_jobs = jobs_schema.dump(jobs)

        for job in serialised_jobs:
            gross_pay += job["gross_pay"]
            tax_due += job["tax_due"]
            net_pay += job["net_pay"]

        return {"year": year, "grossPay": gross_pay, "taxDue": tax_due, "netPay": net_pay}
    else:
        years = []

        jobs_by_years = Job.query.filter_by(user_id=user.id).all()
        serialised_years = jobs_schema.dump(jobs_by_years)

        for year in serialised_years:
            date = datetime.fromisoformat(year["date_created"])
            if date.year not in years:
                years.append(date.year)

        years.sort(reverse=True)

        if not years:
            recent_year = 0
        else:
            recent_year = years[0]

        jobs = Job.query.filter(extract("year", Job.date_created)
                                == recent_year, Job.user_id == user.id).all()
        serialised_jobs = jobs_schema.dump(jobs)

        for job in serialised_jobs:
            gross_pay += job["gross_pay"]
            tax_due += job["tax_due"]
            net_pay += job["net_pay"]

        return {"grossPay": gross_pay, "taxDue": tax_due, "netPay": net_pay, "years": years}


@app.route("/api/bank-details", methods=["GET", "PUT"])
@cross_origin(methods=["GET", "PUT"], headers=["Content-Type", "Authorization"], origin="https://kailafitz.pythonanywhere.com/")
@jwt_required()
def updateBankAccount():
    username_of_logged_in_user = get_jwt_identity()
    user = User.query.filter_by(
        username=username_of_logged_in_user).first()

    if not user:
        return {"message": "Not found"}, 404

    if request.method == "PUT":
        data = request.get_json()
        bic = data["bic"]
        iban = data["iban"]

        if not bic or not iban:
            return {"message": "Values must not be empty"}, 400

        bank_account = BankAccount.query.filter_by(
            username=user.username).first()
        bank_account.bic = bic
        bank_account.iban = iban
        db.session.commit()

    bank_account = BankAccount.query.filter_by(
        username=user.username).first()
    serialised_details = bank_account_schema.dump(bank_account)
    return jsonify(serialised_details), 200


@app.route("/api/personal-details", methods=["GET", "PUT"])
@cross_origin(methods=["GET", "PUT"], headers=["Content-Type", "Authorization"], origin="https://kailafitz.pythonanywhere.com/")
@jwt_required()
def updatePersonalDetails():
    username_of_logged_in_user = get_jwt_identity()
    user = User.query.filter_by(
        username=username_of_logged_in_user).first()

    if not user:
        return {"message": "Not found"}, 404

    if request.method == "PUT":
        data = request.get_json()
        vat_number = data["vat_number"]

        if vat_number == "":
            return {"message": "Values must not be empty"}, 400

        user.vat_number = vat_number
        db.session.commit()

    serialised_details = user_schema.dump(user)
    return jsonify(serialised_details)


@app.route("/api/add-job", methods=["GET", "POST"])
@cross_origin(methods=["GET", "POST"], headers=["Content-Type", "Authorization"], origin="https://kailafitz.pythonanywhere.com/")
@jwt_required()
def addJob():
    username_of_logged_in_user = get_jwt_identity()
    user = User.query.filter_by(
        username=username_of_logged_in_user).first()

    if not user:
        return {"message": "Not found"}, 404

    if request.method == "POST":
        data = request.get_json()
        job_description = data["job_description"]
        gross_pay = float(data["gross_pay"])
        employer_name = data["employer_name"]
        employer_line_1 = data["employer_line_1"]
        employer_line_2 = data["employer_line_2"]
        employer_town = data["employer_town"]
        employer_region = data["employer_region"]
        employer_country = data["employer_country"]

        if job_description == "" or gross_pay == 0.0 or employer_name == "" or employer_name == "Select an employer":
            return {"message": "Values must not be empty"}, 400

        tax = 0
        net = 0

        if (gross_pay < 36800):
            tax = round((gross_pay * .2), 2)
        else:
            tax = round((gross_pay - 36800) * .4 + 7360, 2)

        net = gross_pay - tax

        employer = Employer.query.filter_by(
            employer_name=employer_name, user_id=user.id).first()
        if employer:
            new_job = Job(job_description=job_description, gross_pay=gross_pay,
                          tax_due=tax, net_pay=net, user_id=user.id, employer_name=employer.employer_name)
            db.session.add(new_job)
            db.session.commit()
        else:
            new_employer = Employer(employer_name=employer_name, employer_line_1=employer_line_1, employer_line_2=employer_line_2,
                                    employer_town=employer_town, employer_region=employer_region, employer_country=employer_country, user_id=user.id)
            new_job = Job(job_description=job_description, gross_pay=gross_pay,
                          tax_due=tax, net_pay=net, user_id=user.id, employer_name=employer_name)
            db.session.add(new_employer)
            db.session.add(new_job)
            db.session.commit()
        return {"message": "Success"}, 200
    else:
        employers = Employer.query.filter_by(user_id=user.id).all()

        if employers:
            serialised_employers = employers_schema.dump(employers)
            return jsonify(serialised_employers)
        else:
            return {"message": "No employers found"}, 200


@app.route("/api/records", methods=["GET"])
@cross_origin(methods=["GET"], headers=["Content-Type", "Authorization"], origin="https://kailafitz.pythonanywhere.com/")
@jwt_required()
def records():
    username_of_logged_in_user = get_jwt_identity()
    user = User.query.filter_by(username=username_of_logged_in_user).first()
    if not user:
        return {"message": "Not found"}, 404
    else:
        jobs = Job.query.filter_by(user_id=user.id).order_by(
            Job.date_created.desc()).all()
        serialised_jobs = jobs_schema.dump(jobs)
        return jsonify(serialised_jobs)


@app.route("/api/records/update/<int:id>", methods=["GET", "PUT"])
@cross_origin(methods=["GET", "PUT"], headers=["Content-Type", "Authorization"], origin="https://kailafitz.pythonanywhere.com/")
@jwt_required()
def update_record(id):
    username_of_logged_in_user = get_jwt_identity()
    user = User.query.filter_by(username=username_of_logged_in_user).first()

    if request.method == "PUT":
        data = request.get_json()
        job_description = data["job_description"]
        gross_pay = float(data["gross_pay"])
        date = parser().parse(data["date_created"])
        employer_name = data["employer_name"]
        employer_line_1 = data["employer_line_1"]
        employer_line_2 = data["employer_line_2"]
        employer_town = data["employer_town"]
        employer_region = data["employer_region"]
        employer_country = data["employer_country"]

        if job_description == "" or gross_pay == 0.0 or employer_name == "" or employer_name == "Select an employer":
            return {"message": "Values must not be empty"}, 400

        job = Job.query.filter_by(id=id).first()

        tax = 0
        net = 0

        if (gross_pay < 36800):
            tax = round((gross_pay * .2), 2)
        else:
            tax = round((gross_pay - 36800) * .4 + 7360, 2)

        net = gross_pay - tax

        employer = Employer.query.filter_by(
            employer_name=employer_name, user_id=user.id).first()
        if employer:
            job.job_description = job_description
            job.gross_pay = gross_pay
            job.tax_due = tax
            job.net_pay = net
            job.date_created = date
            job.employer_name = employer_name
            db.session.add(job)
            db.session.commit()
        else:
            new_employer = Employer(employer_name=employer_name, employer_line_1=employer_line_1, employer_line_2=employer_line_2,
                                    employer_town=employer_town, employer_region=employer_region, employer_country=employer_country, user_id=user.id)
            job.job_description = job_description
            job.gross_pay = gross_pay
            job.tax_due = tax
            job.net_pay = net
            job.date_created = date
            job.employer_name = employer_name
            db.session.add(new_employer)
            db.session.add(job)
            db.session.commit()

        return {"message": "Success"}, 200

    else:
        employers = Employer.query.filter_by(user_id=user.id).all()
        if employers:
            serialised_employers = employers_schema.dump(employers)
            job = Job.query.filter_by(id=id).first()
            serialised_job = job_schema.dump(job)
            return jsonify(serialised_job, serialised_employers)
        else:
            return {"message": "No employers found"}


@app.route("/api/records/delete/<int:id>", methods=["DELETE"])
@cross_origin(methods=["DELETE"], headers=["Content-Type", "Authorization"], origin="https://kailafitz.pythonanywhere.com/")
@jwt_required()
def delete_job(id):
    username_of_logged_in_user = get_jwt_identity()
    user = User.query.filter_by(
        username=username_of_logged_in_user).first()

    if not user:
        return {"message": "Not found"}, 404
    else:
        if request.method == "DELETE":
            job = Job.query.filter_by(id=id, user_id=user.id).first()
            db.session.delete(job)
            db.session.commit()
            return {"message": "Job deleted successfully"}, 200


@app.route("/api/records/<int:id>", methods=["GET"])
@cross_origin(methods=["GET"], headers=["Content-Type", "Authorization"], origin="https://kailafitz.pythonanywhere.com/")
@jwt_required()
def invoice(id):
    username_of_logged_in_user = get_jwt_identity()
    user = User.query.filter_by(username=username_of_logged_in_user).first()

    if not user:
        return {"message": "Not found"}, 404
    else:
        the_dict = dict()
        job = Job.query.filter_by(id=id).first()
        bank_account = BankAccount.query.filter_by(
            username=user.username).first()
        user_address = UserAddress.query.filter_by(
            username=user.username).first()
        employer = Employer.query.filter_by(
            employer_name=job.employer_name, user_id=user.id).first()

        serialised_user = user_schema.dump(user)
        serialised_job = job_schema.dump(job)
        serialised_bank_account = bank_account_schema.dump(bank_account)
        serialised_user_address = user_address_schema.dump(user_address)
        serialised_employer = employer_schema.dump(employer)
        the_dict = jsonify(serialised_job,
                           serialised_bank_account, serialised_user_address, serialised_user, serialised_employer)
        return the_dict


@app.route("/api/logout", methods=["GET"])
@jwt_required()
def logout():
    response = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(response)
    return response
