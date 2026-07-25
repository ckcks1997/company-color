"""Alembic 환경 설정.

DB URL은 alembic.ini 가 아니라 app.core.config 의 settings 에서 읽고,
target_metadata 는 SQLModel 메타데이터를 사용한다 — autogenerate 지원.
"""
from __future__ import annotations

import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from sqlalchemy import engine_from_config, pool
from sqlmodel import SQLModel

# 프로젝트 루트(=backend/) 를 sys.path 에 추가해 app.* 를 import 가능하게 한다.
BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.core.config import settings  # noqa: E402
import app.models  # noqa: F401, E402  -- 부수효과: SQLModel 메타데이터에 모델 등록

# Alembic Config 객체
config = context.config

# settings 의 값으로 sqlalchemy.url 을 동적으로 주입.
# alembic.ini 의 sqlalchemy.url 는 비어 있어도 무방.
db_url = (
    f"mysql+pymysql://{settings['DB_USER']}:{settings['DB_PASSWORD']}"
    f"@{settings['DB_HOST']}:{settings['DB_PORT']}/{settings['DB_NAME']}"
)
config.set_main_option("sqlalchemy.url", db_url)

# 로깅 설정
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = SQLModel.metadata


def run_migrations_offline() -> None:
    """오프라인 모드: 실제 DB 에 연결하지 않고 SQL 스크립트만 출력."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """온라인 모드: 실제 DB 에 연결해 마이그레이션 적용."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
