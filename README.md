# Running the app
Navigate into the project folder and run `python src/app.py`

# Prerequisites
* Python 3 (specific version?)
* A MySQL server (or MariaDB)
* pip install...
    * flask
    * flask-oidc
    * flask-sqlalchemy
    * mysqlclient

## Setting up MySQL on Windows
### Install
You can install MariaDB via Chocolatey. A restart is required. The regular downloaded installer should work but hasn't been tested.

### Setup
Assuming MariaDB, open MySQL Client. The default password is blank.

To create the database for the project, run:

`CREATE DATABASE resilience_calculator;`

To create the database user, run:

`GRANT ALL PRIVILEGES ON resilience_calculator.* TO resilience_calculator@localhost IDENTIFIED BY '<your_password>';`

Your database password should be set as `db_pass` in `config.json`.