from fastapi import APIRouter, Depends, HTTPException, status

from src.bll.auth import (
    JWTBearer,
    decode_jwt,
    sign_jwt,
    verify_password,
)
from src.database.collection import user_document
from src.routes.models.auth_models import UserDeleteModel, UserModel, UserUpdateModel


router = APIRouter()


@router.get("/users/", dependencies=[Depends(JWTBearer())])
async def get_all_users(token: str = Depends(JWTBearer())):
    """Register a new user."""
    token_data = decode_jwt(token)
    if token_data["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource",
        )

    return user_document().all()


@router.post("/register/")
async def register_user(user: UserModel):
    """Register a new user."""
    return user_document().create(user.model_dump())


@router.post("/login/")
async def login_user(user: UserModel):
    """Login a user."""
    user_data = user_document().get({"email": user.email})
    if not user_data or not verify_password(user.password, user_data["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )

    return {
        "access_token": sign_jwt(
            user_email=user.email, role="admin" if user_data["is_admin"] else "user"
        ),
        "token_type": "bearer",
    }


@router.post("/update/", dependencies=[Depends(JWTBearer())])
async def update_user(user: UserUpdateModel):
    """Update a user."""
    return user_document().update(
        {"email": user.email}, user.model_dump(exclude_none=True)
    )


@router.post("/delete/", dependencies=[Depends(JWTBearer())])
async def delete_user(user: UserDeleteModel):
    """Delete a user."""
    user_document().delete({"email": user.email})
    return {"message": "User deleted"}
