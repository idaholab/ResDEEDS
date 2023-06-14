# ResDEEDS

## Installation
### Linux
1. Clone the project and submodules.

    `git clone --recurse-submodules https://github.inl.gov/miracle/resilience_calculator.git`

1. Run the install script.

    `cd resilience_calculator`

    `sudo install/install.sh`

    TODO: should the install script create and use a venv?

    TODO: install script for `yum`?

### Windows
#### Prerequisites
* Git (download for Windows [here](https://git-scm.com/download/win))
* Python 3 (download [here](https://www.python.org/downloads/), tested on 3.10)

#### Steps
1. Using Git Bash, clone the project and submodules.

    `git clone --recurse-submodules https://gitlab.software.inl.gov/miracle/resilience_calculator`

1. Create and activate a Python virtual environment for the project.

    `cd resilience_calculator`

    `py -m venv venv`

    `. venv/Scripts/activate`

1. Update pip.

    `python -m pip install --upgrade pip`

1. Install the project.

    `pip install -r requirements.txt`

1. Install Julia.

    `python -m jill install --confirm`

1. Install Julia dependencies.

    `~/AppData/Local/julias/bin/julia.cmd -e 'using Pkg; Pkg.add(url="https://github.com/spine-tools/SpineInterface.jl.git")'`

    `~/AppData/Local/julias/bin/julia.cmd -e 'using Pkg; Pkg.add(url="https://github.com/spine-tools/SpineOpt.jl.git")'`

    `~/AppData/Local/julias/bin/julia.cmd -e 'using Pkg; Pkg.add(["XLSX", "DataFrames", "Distributions", "CSV", "Revise", "Cbc", "Clp"])'`

1. Create `config/local.json` and override default config settings as needed. At a minimum, override `"app_secret_key"` with a random string.

## Running the app
1. Navigate into the project folder on the command line.

1. Activate the Python virtual environment.

1. Run `python src/app.py`.

## Accessing the app
In a web browser, visit the URL printed on the console during startup (e.g. http://127.0.0.1:5000).

## Configuration
### Overview
Configuration is done via JSON in `config/local.json` (create this file if it does not exist). This JSON overrides the values found in `config/config.json`.

### Options
* `app_secret_key` - identifies your Flask app. Should remain secret.
* `debug_mode` - set to `true` to enable Flask debugging.
* `use_okta` - set to `true` to enable Okta authentication. Configure your Okta instance in a `config/client_secrets.json`. If this is set to `false`, the app runs in an unauthenticated mode, where all users can see all projects.
* `okta` - partial Okta configuration. The remainder is found in a `config/client_secrets.json` file like [this one](https://github.com/okta/samples-python-flask/blob/master/okta-hosted-login/client_secrets.json.dist).
    * `orgUrl` - the Okta organization URL, e.g. https://example.okta.com.
    * `token` - your API token.
* `database` - database configuration.
    * `dialect` - the dialect used for SQLAlchemy. Options are "sqlite" and "mysql".
    * `db_name` - the name of the SQL database.
    * `db_user` - (mysql only) the name of the SQL database user. The user should have all privileges on the database.
    * `db_pass` - (mysql only) the password of the SQL database user.
    * `db_host` - (mysql only) the host for the SQL server. Use `localhost` if running locally.
    * `drop_and_recreate` - if `true`, drops and recreates the database on Flask app startup. Intended for development/debugging only.

## MySQL Suport
To use MySQL, install the `mysqlclient` package with pip. TODO: document configuration.

### Setting up MySQL on Windows
If you are using the mysql dialect option for the database, you will need a MySQL or MariaDB server to connect to. These instructions are for if you want to run it locally on Windows.

#### Install
You can install MariaDB via Chocolatey or via the installer for MariaDB Server available at https://mariadb.org/download/. If you plan to run the app locally, you do not need to enable networking for MariaDB server.

#### Run MySQL Service
To start the MySQL service, open the Services app in Windows, find the MySQL service, right-click it and select Start.

#### Setup
Assuming MariaDB, open MySQL Client (installed along with MariaDB). The default password is blank.

To create the database for the project, run:

`CREATE DATABASE resilience_calculator;`

To create the database user, run:

`GRANT ALL PRIVILEGES ON resilience_calculator.* TO resilience_calculator@localhost IDENTIFIED BY '<your_password>';`

Your database password should be set as `db_pass` in `config/local.json`.
