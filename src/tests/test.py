from conftests import app, client

def test_make_proj(client):
    client.get("/")
    data = {"projNameValAdd": "testproj"}
    response = client.post("/", data=data)
    assert response.status == "302 FOUND"

def test_submit_xlsx(client):
    client.get("/")
    data = {"projNameValAdd": "testproj1"}
    response = client.post("/", data=data)
    data = {"system_spreadsheet": (open('src/tests/test.xlsx', 'rb')),}
    response = client.post("/qualities", data=data)
    assert response.status == "200 OK"
    # assert b"Error" not in response.data
