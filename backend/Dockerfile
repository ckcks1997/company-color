FROM python:3.12

# Poetry 설치
RUN pip install poetry

# 작업 디렉토리 설정
WORKDIR /app

# Poetry 설정 파일 복사
COPY pyproject.toml poetry.lock ./
COPY ./app/.env /app/.env

# Poetry를 사용하여 의존성 설치
RUN poetry config virtualenvs.create false \
  && poetry install --no-interaction --no-ansi

# 애플리케이션 코드 복사
COPY ./app ./app

# FastAPI 실행
CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]