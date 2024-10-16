# Copyright 2023, Battelle Energy Alliance, LLC
import sys
sys.path.append("./src")
from app import app

app.testing = True

def test_make_proj():
    with app.test_client() as client:
        client.get("/")
        data = {"projNameValAdd": "testproj"}
        response = client.post("/", data=data)
        assert response.status == "302 FOUND"

def test_submit_xlsx():
    with app.test_client() as client:
        client.get("/")
        data = {"projNameValAdd": "testproj1"}
        response = client.post("/", data=data)
        data = {"system_spreadsheet": (open('src/tests/test.xlsx', 'rb')),}
        response = client.post("/qualities", data=data)
        assert response.status == "200 OK"
        # assert b"Error" not in response.data
