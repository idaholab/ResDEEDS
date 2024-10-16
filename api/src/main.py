from fastapi import FastAPI

app = FastAPI(title="ResDEEDS")


@app.get("/")
def read_root():
    """Hello World root."""
    return {"Hello": "World"}
