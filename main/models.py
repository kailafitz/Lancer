from sqlalchemy import Column, ForeignKey, Integer, Float, String, DateTime
from datetime import datetime
from sqlalchemy.orm import relationship
from routes import db


class User(db.Model):
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(30), nullable=False)
    email = Column(String(70), nullable=False)
    password = Column(String(100), nullable=False)
    vat_number = Column(String(50), nullable=False)
    date_joined = Column(DateTime(), default=datetime.utcnow, nullable=False)

    jobs = relationship("Job")
    bank_account = relationship(
        "BankAccount", back_populates="user", uselist=False)
    address = relationship("UserAddress", back_populates="user", uselist=False)
    employers = relationship("Employer", back_populates="user")

    def to_json(self):
        return {"username": self.username,
                "email": self.email}

    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        return str(self.id)


class BankAccount(db.Model):
    id = Column(Integer, primary_key=True, autoincrement=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    bic = Column(String(50), nullable=False)
    iban = Column(String(100), nullable=False)
    username = Column(String, ForeignKey("user.username"))

    user = relationship("User", back_populates="bank_account")


class UserAddress(db.Model):
    id = Column(Integer, primary_key=True, autoincrement=True)
    line_1 = Column(String(50), nullable=False)
    line_2 = Column(String(50), nullable=False)
    town = Column(String(50), nullable=False)
    region = Column(String(100), nullable=False)
    country = Column(String(50), nullable=False)
    username = Column(String, ForeignKey("user.username"))

    user = relationship("User", back_populates="address")


class Job(db.Model):
    id = Column(Integer, primary_key=True, autoincrement=True)
    job_description = Column(String(200), nullable=False)
    gross_pay = Column(Float(), nullable=False)
    tax_due = Column(Float(), nullable=True)
    net_pay = Column(Float(), nullable=True)
    date_created = Column(DateTime(), default=datetime.utcnow, nullable=False)
    user_id = Column(Integer, ForeignKey("user.id"))
    employer_name = Column(String, ForeignKey("employer.employer_name"))

    employer = relationship("Employer", back_populates="jobs")


class Employer(db.Model):
    id = Column(Integer, primary_key=True, autoincrement=True)
    employer_name = Column(String(100), nullable=False)
    employer_line_1 = Column(String(50), nullable=False)
    employer_line_2 = Column(String(50), nullable=False)
    employer_town = Column(String(50), nullable=False)
    employer_region = Column(String(100), nullable=False)
    employer_country = Column(String(100), nullable=False)
    user_id = Column(Integer, ForeignKey("user.id"))

    jobs = relationship("Job", back_populates="employer")
    user = relationship("User", back_populates="employers")
