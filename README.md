# Running the app
Navigate into the project folder and run `python src/app.py` (or possibly `py src/app.py` on Windows).

# Accessing the app
Visit the URL printed on the console during startup (e.g. http://127.0.0.1:5000).

# Installing from Source
## Prerequisites
* Python 3.7 or 3.8 (per Spine Toolbox requirements - possibly can be relaxed with newer Spine Toolbox?)
* A MySQL or MariaDB server (if not using sqlite)
* pip install...
    * flask
    * flask-sqlalchemy
* If using mysql for the app database, also pip install...
    * mysqlclient
* If using Okta authentication, also pip install...
    * flask-oidc 
    * okta

## Instructions
1. Clone the project and submodules

    `git clone --recurse-submodules https://gitlab.software.inl.gov/miracle/resilience_calculator`

1. Install Spine Database API

    `cd resilience_calculator/spine/`

    `git clone https://github.com/Spine-project/Spine-Database-API.git`

1. Install Spine Toolbox

    `cd resilience_calculator/spine/`

    `git clone https://github.com/Spine-project/Spine-Toolbox.git`

1. Create a virtual environment for SpineToolbox, making sure to use Python 3.8

    `cd resilience_calculator/spine/Spine-Toolbox`

    `/path/to/python3.8/python -m venv .venv`

1. Activate the venv using the `activate` script

1. Install SpineToolbox

    `pip install -r requirements.txt`

1. (Optional) Install and set up MySQL/MariaDB (see below)

1. Set up the Spine Toolbox workflow. TODO: make this process better...

    1. Run the Flask app and create a new project. (Try to) upload a spreadsheet.

    1. With the Spine Toolbox venv activated, open the project in Spine Toolbox.

        `python spine/Spine-Toolbox/spinetoolbox.py &`

        Then File->Open project. Your new project should be in `spine/projects/`.

    1. If needed, install Julia from File -> Settings -> Tools.

    1. Install the SpineOpt Julia package from the same screen.

    1. Open a Julia command line and install Revise, SpineInterface, XLSX, DataFrames, Distributions, and CSV

    1. Run the workflow to make sure it will complete successfully by pressing the Project "play" button

## Setting up MySQL on Windows
If you are using the mysql dialect option for the database, you will need a MySQL or MariaDB server to connect to. These instructions are for if you want to run it locally on Windows.

### Install
You can install MariaDB via Chocolatey or via the installer for MariaDB Server available at https://mariadb.org/download/. If you plan to run the app locally, you do not need to enable networking for MariaDB server.

### Run MySQL Service
To start the MySQL service, open the Services app in Windows, find the MySQL service, right-click it and select Start.

### Run MySQL Service
To start the MySQL service, open the Services app in Windows, find the MySQL service, right-click it and select Start.

### Setup
Assuming MariaDB, open MySQL Client (installed along with MariaDB). The default password is blank.

To create the database for the project, run:

`CREATE DATABASE resilience_calculator;`

To create the database user, run:

`GRANT ALL PRIVILEGES ON resilience_calculator.* TO resilience_calculator@localhost IDENTIFIED BY '<your_password>';`

Your database password should be set as `db_pass` in `config/config.json`.

# Configuring
## Overview
Configuration is done via JSON in `config/config.json`. If you use Okta, additional configuration is found in `config/client_secrets.json`. **Do not commit your sensitive configuration data to git.**

## Options in `config.json`
* `app_secret_key` - identifies your Flask app. Should remain secret.
* `debug_mode` - set to `true` to enable Flask debugging.
* `use_okta` - set to `true` to enable Okta authentication. Configure your Okta instance in `client_secrets.json`. If this is set to `false`, the app runs in an unauthenticated mode, where all users can see all projects. This is meant for local deployments.
* `database` - database configuration.
    * `dialect` - the dialect used for SQLAlchemy. Options are "sqlite" and "mysql".
    * `db_name` - the name of the SQL database.
    * `db_user` - the name of the SQL database user. The user should have all privileges on the database.
    * `db_pass` - the password of the SQL database user.
    * `db_host` - the host for the SQL server. Use `localhost` if running locally.
    * `drop_and_recreate` - if `true`, drops and recreates the database on Flask app startup. Intended for development/debugging only.