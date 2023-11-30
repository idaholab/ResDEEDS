# ResDEEDS
## Intro
Access to reliable, resilient power systems is important in 21st century now more than ever. Terrestrial weather events exacerbated by climate change and extreme weather conditions are happening with greater frequency and intensity. Cyberattacks are seen at an increasing frequency against the power grid, and the attacks are becoming more sophisticated and targeted towards electric energy systems. The Idaho National Laboratory (INL), with funding from the Department of Energy (DOE) Wind Energy Technologies Office (WETO), has developed a [Resilinece Framework]([http://www.spine-model.org](https://resilience.inl.gov/wp-content/uploads/2021/07/21-50152_RF_EEDS_R4.pdf) for electric energy delivery systems (EEDS). The framework provides detailed steps for evaluating resiliency in the planning, operational, and future stages, and encompasses five core functions of resilience. It allows users to evaluate the resilience of distributed wind, taking into consideration the resilience of the wind systems themselves, as well as the effect they have on the resiliency of any systems they are connected to. This application follows the framework to allow stakeholders to evaluate their current position, create resiliency goals, compare different configuration and operation options, and decide which metrics are most appropriate for their system.

## Overview
This tool is implemented as a Flask (Python) web application. It is currently primarily intended to be run/hosted locally by the end user. The app uses the [Spine Toolbox and SpineOpt](http://www.spine-model.org/) modeling tools to calculate values for resilience metrics. The input to Spine is an Excel spreadsheet of user system data and hazard modeling data.

## Installation
### Linux
1. Clone the project and submodules.

    `git clone --recurse-submodules https://github.com/idaholab/ResDEEDS.git`

1. Run the install script.

    `cd ResDEEDS`

    `sudo install/install.sh`

### Windows
#### Prerequisites
* Git (download for Windows [here](https://git-scm.com/download/win))
* Python 3 (download [here](https://www.python.org/downloads/release/python-3100/), tested on 3.10)

#### Steps
1. Using Git Bash, clone the project and submodules.

    `git clone --recurse-submodules https://github.com/idaholab/ResDEEDS.git`

1. Create and activate a Python virtual environment for the project.

    `cd ResDEEDS`

    `py -m venv venv`

    `. venv/Scripts/activate`

1. Update pip.

    `python -m pip install --upgrade pip`

1. Install the project.

    `pip install -r requirements.txt`

1. Install Julia.

    `python -m jill install --confirm`

1. Install Julia dependencies.

    `~/AppData/Local/Programs/Julia-1.9.0/bin/julia.exe -e 'using Pkg; Pkg.add(url="https://github.com/spine-tools/SpineInterface.jl.git")'`

    `~/AppData/Local/Programs/Julia-1.9.0/bin/julia.exe -e 'using Pkg; Pkg.add(url="https://github.com/spine-tools/SpineOpt.jl.git")'`

    `~/AppData/Local/Programs/Julia-1.9.0/bin/julia.exe -e 'using Pkg; Pkg.add(["XLSX", "DataFrames", "Distributions", "CSV", "Revise", "Cbc", "Clp"])'`

1. Run Spine Toolbox to initialize configuration. You can close it after it opens.

    `python -m toolbox &`

1. Configure Spine Toolbox's Julia paths.

    `python venv/src/spinetoolbox/bin/configure_julia.py "C:/Users/$(whoami)/AppData/Local/Programs/Julia-1.9.0/bin/julia.exe" ""`

1. Create `config/local.json` and override default config settings as needed. At a minimum, override `"app_secret_key"` with a random string.

## Running the app
### Windows
1. Navigate into the project folder using GitBash or PowerShell (we don't recommend running the app in an IDE-integrated terminal).

    `cd $PROJECT_ROOT`

    where `$PROJECT_ROOT` is your `ResDEEDS` folder. On at least some version of Windows, you can also navigate to the folder in File Explorer, right-click on a blank space, and select `Open in Terminal`.

1. Activate the Python virtual environment.

    `. venv\Scripts\activate`

1. Run `python src/app.py`.

### Linux
1. Run `install/run.sh`.

## Accessing the app
In a web browser, visit `http://localhost:5000`, or the URL printed to the console during startup, if different.

## Configuration
### Overview
Configuration is done via JSON in `config/local.json` (create this file if it does not exist). This JSON overrides the values found in `config/config.json`.

### Options
* `app_secret_key` - identifies your Flask app. Should remain secret.
* `debug_mode` - set to `true` to enable Flask debugging.
* `verbose_logging` - set to `true` to enable debug log messages.
* `use_okta` - set to `true` to enable Okta authentication. Configure your Okta instance in a `config/client_secrets.json`. If this is set to `false`, the app runs in an unauthenticated mode, where all users can see all projects. For a single user running the app locally, we recommend setting this to `false`.
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

## MySQL Support
SQLite is used by default. MySQL is experimentally supported. To use MySQL, install the `mysqlclient` package with pip.

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
