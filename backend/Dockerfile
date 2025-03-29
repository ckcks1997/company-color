FROM python:3.12-slim

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 설치
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    default-libmysqlclient-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Poetry 설치
RUN pip install poetry

# Poetry 설정 파일 복사 및 의존성 설치
COPY pyproject.toml poetry.lock ./
RUN poetry install --no-root

# 애플리케이션 코드 복사
COPY . .

# 로그 디렉터리 생성
RUN mkdir -p /app/app/logs && chmod 777 /app/app/logs


# FastAPI 실행
CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--app-dir", "/app", "--env-file", "/app/.env.prod"]
