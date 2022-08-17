from main import ma
from main.models import Job, User, BankAccount, UserAddress, Employer


class JobSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Job

    id = ma.auto_field()
    job_description = ma.auto_field()
    gross_pay = ma.auto_field()
    tax_due = ma.auto_field()
    net_pay = ma.auto_field()
    date_created = ma.auto_field()
    user_id = ma.auto_field()
    employer_name = ma.auto_field()


class BankAccountSchema(ma.SQLAlchemySchema):
    class Meta:
        model = BankAccount

    id = ma.auto_field()
    first_name = ma.auto_field()
    last_name = ma.auto_field()
    bic = ma.auto_field()
    iban = ma.auto_field()


class UserAddressSchema(ma.SQLAlchemySchema):
    class Meta:
        model = UserAddress

    id = ma.auto_field()
    line_1 = ma.auto_field()
    line_2 = ma.auto_field()
    town = ma.auto_field()
    region = ma.auto_field()
    country = ma.auto_field()


class UsersSchema(ma.SQLAlchemySchema):
    class Meta:
        model = User

    id = ma.auto_field()
    username = ma.auto_field()
    email = ma.auto_field()
    password = ma.auto_field()
    vat_number = ma.auto_field()
    date_joined = ma.auto_field()


class EmployerSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Employer

    employer_name = ma.auto_field()
    employer_line_1 = ma.auto_field()
    employer_line_2 = ma.auto_field()
    employer_town = ma.auto_field()
    employer_region = ma.auto_field()
    employer_country = ma.auto_field()
