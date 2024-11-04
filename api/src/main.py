from fastapi import FastAPI

from src.routes import auth, projects

app = FastAPI(title="ResDEEDS")

app.include_router(auth.router, tags=["Auth"], prefix="/api/auth")
app.include_router(projects.router, tags=["Projects"], prefix="/api/projects")


@app.get("/")
def read_root():
    """Hello World root."""
    return {"Hello": "World"}
