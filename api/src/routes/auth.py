from fastapi import APIRouter

from src.database.collection import user_document
from src.routes.models.auth_models import UserDeleteModel, UserModel, UserUpdateModel


router = APIRouter()


@router.post("/register/")
async def register_user(user: UserModel):
    """Register a new user."""
    return user_document().create(user.model_dump())


@router.post("/login/")
async def login_user(user: UserModel):
    """Login a user."""
    return user_document().get({"email": user.email})


@router.post("/update/")
async def update_user(user: UserUpdateModel):
    """Update a user."""
    return user_document().update(
        {"email": user.email}, user.model_dump(exclude_none=True)
    )


@router.post("/delete/")
async def delete_user(user: UserDeleteModel):
    """Delete a user."""
    return user_document().delete({"email": user.email})
