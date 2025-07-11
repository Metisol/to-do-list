from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from crud import get_user,create_user
from models import User
from schemas import UserCreate,TokenResponse
from database import get_db
from datetime import datetime ,timedelta
from fastapi.responses import JSONResponse
from passlib.context import CryptContext

SECRET_KEY = "your-secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router =APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme=OAuth2PasswordBearer(tokenUrl="/auth/login")

def verify_password(palin_password, hashed_password):
    return pwd_context.verify(palin_password,hashed_password)


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = get_user(db, username)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/register",status_code=201)
def register(user_data: UserCreate,db: Session = Depends(get_db)):
    existing_user= get_user(db,user_data.username)
    if existing_user:
        raise HTTPException(status_code=404,detail="username already taken")
    User=create_user(db, user_data.username,user_data.password)
    return {"message": "user registered successfully"}

@router.post("/login")

def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(user)
    return {"access_token": token, "token_type": "bearer"}
