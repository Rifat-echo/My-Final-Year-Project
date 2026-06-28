from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    studytime = Column(Integer, nullable=False)
    failures = Column(Integer, nullable=False)
    absences = Column(Integer, nullable=False)
    G1 = Column(Integer, nullable=False)
    G2 = Column(Integer, nullable=False)

    prediction = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)