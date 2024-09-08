from app.core.database import get_db
from sqlmodel import Session
from fastapi import Depends
from typing import Annotated

SessionDep = Annotated[Session, Depends(get_db)]
