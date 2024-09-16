from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class RedisSettings(BaseSettings):
    REDIS_HOST: str
    REDIS_PORT: str
    REDIS_DB: str
    REDIS_PASSWORD: str = Field(..., env="REDIS_PASSWORD")
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


class DBSettings(BaseSettings):
    DB_HOST: str
    DB_PORT: str
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: str = Field(..., env="DB_PASSWORD")
    ALLOW_ORIGINS: str
    ENVIRONMENT: str
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: str

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


class KakaoSettings(BaseSettings):
    KAKAO_CLIENT_ID: str
    KAKAO_WEB_CLIENT_ID: str
    KAKAO_CLIENT_SECRET: str= Field(..., env="KAKAO_CLIENT_SECRET")
    KAKAO_REDIRECT_URI: str
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

class ElasticSettings(BaseSettings):
    ELASTIC_HOST: str
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

redis_Settings = RedisSettings()
db_settings = DBSettings()
kakao_settings = KakaoSettings()
elastic_settings = ElasticSettings()