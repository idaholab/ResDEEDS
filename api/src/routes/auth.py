from fastapi import APIRouter

from src.database.models import UserModel


router = APIRouter()


@router.post("/register/")
async def register_user(user: UserModel):
    return {"msg": "User registered successfully"}
