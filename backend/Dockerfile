FROM python:3.12

# 작업 디렉토리 설정
WORKDIR /app

# Poetry 설치
RUN pip install poetry

# Poetry 설정 파일 복사
COPY pyproject.toml poetry.lock ./
RUN poetry install --no-root

# 애플리케이션 코드 복사
COPY . .

# FastAPI 실행
CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--app-dir", "/app", "--env-file", "/app/app/.env.prod"]
