from fastapi import FastAPI

from src.routes import auth

app = FastAPI(title="ResDEEDS")

app.include_router(auth.router, tags=["Auth"], prefix="/api/auth")


@app.get("/")
def read_root():
    """Hello World root."""
    return {"Hello": "World"}
