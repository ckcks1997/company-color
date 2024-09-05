import httpx
from fastapi import FastAPI, HTTPException, Depends, APIRouter
from fastapi.security import OAuth2PasswordBearer
from app.config import settings
from app.auth.jwt import create_access_token
router = APIRouter()

# 설정
KAKAO_CLIENT_ID = settings.KAKAO_CLIENT_ID
KAKAO_WEB_CLIENT_ID = settings.KAKAO_WEB_CLIENT_ID
KAKAO_CLIENT_SECRET = settings.KAKAO_CLIENT_SECRET
KAKAO_REDIRECT_URI = settings.KAKAO_REDIRECT_URI
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@router.get("/login/kakao")
async def login_kakao():
    return {
        "url": f"https://kauth.kakao.com/oauth/authorize?client_id={KAKAO_WEB_CLIENT_ID}&redirect_uri={KAKAO_REDIRECT_URI}&response_type=code"
    }


@router.get("/oauth")
async def kakao_callback(code: str):
    token_url = "https://kauth.kakao.com/oauth/token"
    data = {
        "grant_type": "authorization_code",
        "client_id": KAKAO_CLIENT_ID,
        "client_secret": KAKAO_CLIENT_SECRET,
        "code": code,
        "redirect_uri": KAKAO_REDIRECT_URI,
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=data)

    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Kakao OAuth failed")

    access_token = response.json()["access_token"]

    user_info_url = "https://kapi.kakao.com/v2/user/me"
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        response = await client.get(user_info_url, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to get user info")

    user_info = response.json()

    # JWT 토큰 생성
    jwt_token = create_access_token(
        data={"sub": user_info["id"]}
    )

    return {"access_token": jwt_token, "token_type": "bearer"}
