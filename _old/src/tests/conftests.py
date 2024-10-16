# Copyright 2023, Battelle Energy Alliance, LLC
import sys, os
sys.path.insert(0, os.path.abspath('./src'))
import pytest
print(sys.path)
from app import app as main_app


@pytest.fixture()
def app():
    app = main_app
    app.config.update(
        {
            "TESTING": True,
        }
    )

    # other setup can go here

    yield app

    # clean up / reset resources here


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def runner(app):
    return app.test_cli_runner()
