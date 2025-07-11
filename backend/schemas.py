from pydantic import BaseModel


class  ToDoCreate(BaseModel):
    title: str

class Token(BaseModel):
    access_token:str
    token_type:str
    
class ToDoResponse(BaseModel):
    id:int
    title:str
    completed:bool



    class Config:
        rom_mode=True
class UserCreate(BaseModel):
    username:str
    password:str

class TokenResponse(BaseModel):
    access_token:str
    token_type:str = "bearer"          