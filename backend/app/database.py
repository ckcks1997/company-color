from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String
from databases import Database
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

DATABASE_URL = "sqlite:///../sqlite"
database = Database(DATABASE_URL)
metadata = MetaData()

engine = create_engine(DATABASE_URL)
Base = declarative_base()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
