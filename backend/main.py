from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.security import OAuth2PasswordRequestForm
from scipy import stats
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
import auth
from database import  SessionLocal, engine
import models, crud, schemas
from models import Base, ToDo
from models  import User
from auth import router as auth_router
from auth import verify_password,create_access_token
from auth import get_current_user
Base.metadata.create_all(bind=engine)

app = FastAPI()
@app.get("/")
def read_root ():
     return {"message": "Welcome to the To-DO List API"}
app.include_router(auth_router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/auth/register")
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username taken")
    return crud.create_user(db, user.username, user.password)

@app.post("/auth/login")

def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()

    if not user or not verify_password(form_data.password,user.hashed_password): 

        raise HTTPException(status_code=stats.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    
    token = create_access_token( data={"sub" :user.username})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/todos", response_model=list[schemas.ToDoResponse])
def read_todos(
    completed: bool = Query(None),
    db: Session = Depends(get_db),
    current_user:User=Depends(get_current_user)
 ):
     return crud.get_todos(db, completed)

@app.post("/todos", response_model=schemas.ToDoResponse)
def create(todo: schemas.ToDoCreate, db: Session = Depends(get_db)):
    return crud.create_todo(db, todo)

@app.put("/todos/{todo_id}", response_model=schemas.ToDoResponse)
def toggle(todo_id: int, db: Session = Depends(get_db)):
    todo=db.query(ToDo).get(todo_id)
    if todo:
        todo.completed=not todo.completed
        db.commit()
        return todo
    raise HTTPException(status_code=404 , detail="Todo not found")

@app.delete("/todos/{todo_id}")
def delete(todo_id: int, db: Session = Depends(get_db)):
    crud.delete_todo(db, todo_id)
    return {"message": "Deleted"}
