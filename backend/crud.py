from requests import Session
from sqlalchemy.orm import session
import schemas
import models
from models import ToDo, User
from schemas import ToDoCreate
from passlib.context import CryptContext
from models import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_user(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, username: str, password: str):
    hashed_passoword =pwd_context.hash(password)
    user = User(username=username, hashed_password=hashed_passoword)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)
def get_todos(db: Session, completed: bool = None):
    query = db.query(ToDo)
    if completed is not None:
        query = query.filter(ToDo.completed == completed)
    return query.all()

def create_todo(db:session ,todo: schemas.ToDoCreate):
    db_todo =ToDo(title=todo.title)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

def toggle_completed(db:session,todo_id:int):
    todo =db.query(ToDo).get(todo_id)
    if todo:
        todo.completed=not todo.completed
        db.commit()
        return todo
def delete_todo(db: session , todo_id :int):
    todo = db.query(ToDo).get(todo_id)
    if todo:
        db.delete(todo)
        db.commit        