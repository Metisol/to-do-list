from sqlalchemy import Column, Integer, String, Boolean
from database import Base

class User(Base):
    __tablename__= "users"

    id=Column(Integer,primary_key=True,index=True)
    username=Column(String,  unique=True, index=True)
    hashed_password=Column(String)
    role=Column(String , default="student")

class ToDo(Base):
    __tablename__ = "todos" 

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)      
    completed = Column(Boolean, default=False)  # 
