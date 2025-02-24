import httpx
from fastapi import HTTPException, APIRouter
from fastapi.security import OAuth2PasswordBearer
from app.core.config import kakao_settings
from app.auth.jwt import create_access_token
from app.api.deps import SessionDep
from app.crud import get_or_create_user

router = APIRouter()

# 설정
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@router.get("/login/kakao")
async def login_kakao():
    return {
        "url": f"https://kauth.kakao.com/oauth/authorize?client_id={kakao_settings.KAKAO_WEB_CLIENT_ID}&redirect_uri={kakao_settings.KAKAO_REDIRECT_URI}&response_type=code"
    }


@router.get("/oauth")
async def kakao_callback(code: str, db: SessionDep):
    token_url = "https://kauth.kakao.com/oauth/token"
    data = {
        "grant_type": "authorization_code",
        "client_id": kakao_settings.KAKAO_CLIENT_ID,
        "client_secret": kakao_settings.KAKAO_CLIENT_SECRET,
        "code": code,
        "redirect_uri": kakao_settings.KAKAO_REDIRECT_URI,
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

    # 사용자 정보 조회 또는 생성
    user = await get_or_create_user(db, user_info)

    # JWT 토큰 생성
    jwt_token = create_access_token(
        data={"sub": user.SOCIAL_KEY}
    )

    return {"access_token": jwt_token, "token_type": "bearer", "user_id": user.ID}


