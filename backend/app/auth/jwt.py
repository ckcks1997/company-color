from fastapi import HTTPException
from jose import jwt
from datetime import datetime, timedelta
from app.core.config import db_settings

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now() + timedelta(minutes=int(db_settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, db_settings.SECRET_KEY, algorithm=db_settings.ALGORITHM)
    return encoded_jwt

def validate_access_token(data: dict):
    try:
        decoded_jwt = jwt.decode(data, db_settings.SECRET_KEY, algorithms=db_settings.ALGORITHM)
        now = datetime.now()
        if (decoded_jwt['exp'] < now):
            return decoded_jwt
        else:
            raise HTTPException(status_code=401, detail="token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

