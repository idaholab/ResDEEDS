from fastapi import APIRouter, Depends, HTTPException, status

from src.bll.auth import (
    JWTBearer,
    decode_jwt,
    hash_password,
    sign_jwt,
    verify_password,
)
from src.database.collection import user_document
from src.models.payload.auth_models import (
    UserModel,
    UserUpdateModel,
)


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
    payload = user.model_dump()
    payload["password"] = hash_password(user.password)
    return user_document().create(payload)


@router.post("/login/")
async def login_user(user: UserModel):
    """Login a user."""
    user_data = user_document().get(query={"email": user.email})
    if not user_data or not verify_password(user.password, user_data["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )
    return sign_jwt(
        user_email=user.email, user_id=user_data["_id"], role=user_data["role"]
    )


@router.post("/update/", dependencies=[Depends(JWTBearer())])
async def update_user(user: UserUpdateModel, token: str = Depends(JWTBearer())):
    """Update a user."""
    token_data = decode_jwt(token)
    payload = user.model_dump(exclude_none=True)
    if "password" in payload:
        payload["password"] = hash_password(payload["password"])
    user_data = user_document().update({"email": token_data["user_email"]}, payload)
    return user_data["_id"] if user_data else {"detail": "User not found"}


@router.delete("/delete/")
async def delete_user(token: str = Depends(JWTBearer())):
    """Delete a user."""
    token_data = decode_jwt(token)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource",
        )
    user_document().delete({"email": token_data["user_email"]})
    return {"detail": "User deleted"}
