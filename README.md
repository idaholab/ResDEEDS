# Running the app
Navigate into the project folder and run `python src/app.py`

# Installing from Source
## Prerequisites
* Python 3.7 or 3.8 (per Spine Toolbox requirements)
* A MySQL or MariaDB server
* pip install...
    * flask
    * flask-oidc
    * flask-sqlalchemy
    * mysqlclient
    * okta

## Instructions
1. Clone the project and submodules

    `git clone --recurse-submodules https://gitlab.software.inl.gov/miracle/resilience_calculator`

1. Create a virtual environment for SpineToolbox, making sure to use Python 3.8

    `cd resilience_calculator/spine/Spine-Toolbox`

    `/path/to/python3.8/python -m venv .venv`

1. Activate the venv using the `activate` script

1. Install SpineToolbox

    `pip install -r requirements.txt`

1. Install and set up MySQL/MariaDB (see below)

## Setting up MySQL on Windows
### Install
You can install MariaDB via Chocolatey or via the normal installer.

### Setup
Assuming MariaDB, open MySQL Client. The default password is blank.

To create the database for the project, run:

`CREATE DATABASE resilience_calculator;`

To create the database user, run:

`GRANT ALL PRIVILEGES ON resilience_calculator.* TO resilience_calculator@localhost IDENTIFIED BY '<your_password>';`

Your database password should be set as `db_pass` in `config/config.json`.