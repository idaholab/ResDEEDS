from time import time
import os
from typing import Optional

import bcrypt
from fastapi import HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt.exceptions import DecodeError


ALGORITHM = "HS256"
SECRET_KEY = os.getenv("SECRET_KEY", "")


def hash_password(password: str) -> bytes:
    """Hash password."""
    return bcrypt.hashpw(str.encode(password), bcrypt.gensalt(14))


def verify_password(plain_password: str, hashed_password: bytes) -> bool:
    """Verify password."""
    return bcrypt.checkpw(str.encode(plain_password), hashed_password)


class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: Optional[HTTPAuthorizationCredentials] = await super(
            JWTBearer, self
        ).__call__(request)

        if not credentials:
            raise HTTPException(status_code=403, detail="Invalid authorization code.")

        if not credentials.scheme == "Bearer":
            raise HTTPException(
                status_code=403, detail="Invalid authentication scheme."
            )
        if not self.verify_jwt(credentials.credentials):
            raise HTTPException(
                status_code=403, detail="Invalid token or expired token."
            )

        return credentials.credentials

    def verify_jwt(self, jwtoken: str) -> bool:
        payload = decode_jwt(jwtoken)

        if not payload:
            return False

        return True


def decode_jwt(token: str) -> dict:
    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return decoded_token if decoded_token["expires"] >= time() else {}
    except DecodeError:
        raise HTTPException(status_code=403, detail="Invalid or expired token.")


def sign_jwt(user_email: str, role: str) -> dict[str, str]:
    payload = {"user_email": user_email, "expires": time() + 600, "role": role}
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    return {"access_token": token}
