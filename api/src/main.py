from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routes import auth
from src.routes.projects import projects, cases, analysis

app = FastAPI(title="ResDEEDS")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router, tags=["Auth"], prefix="/api/auth")
app.include_router(projects.router, tags=["Projects"], prefix="/api/projects")
app.include_router(cases.router, tags=["Cases"], prefix="/api/projects")
app.include_router(analysis.router, tags=["Analysis"], prefix="/api/projects")


@app.get("/")
def health_check():
    """Hello World root."""
    return {"Hello": "World"}
