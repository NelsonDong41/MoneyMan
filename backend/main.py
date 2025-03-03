import os
from typing import Optional
from fastapi import Depends, FastAPI, HTTPException
from schemas import Receipt, Item
from supabase import create_client, Client
from dotenv import load_dotenv
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from postgrest.exceptions import APIError
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()

url: str = os.environ.get("SUPABASE_PROJECT_URL")
key: str = os.environ.get("SUPABASE_API_KEY")

assert url, "SUPABASE_PROJECT_URL does not exist"
assert key, "SUPABASE_API_KEY does not exist"

supabase: Client = create_client(url, key)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Replace with your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()


async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        user = supabase.auth.get_user(token)
        return user
    except Exception as e:
        raise HTTPException(
            status_code=401, detail=f"Invalid or expired token: {str(e)}"
        )


@app.post("/protected-route")
async def protected_route(user: dict = Depends(verify_token)):
    # Your protected route logic here
    return {"message": "Access granted", "user_id": user.id}


class SignUpBody(BaseModel):
    email: str
    password: str


@app.post("/signup")
async def signup(request: Request):
    body = SignInBody(**(await request.json()))
    try:
        response = supabase.auth.sign_up(
            {"email": body.email, "password": body.password}
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=401, detail="Authentication failed")


class SignInBody(BaseModel):
    email: str
    password: str


@app.post("/signin")
async def signin(request: Request):
    body = SignInBody(**(await request.json()))

    try:
        response = supabase.auth.sign_in_with_password(
            {"email": body.email, "password": body.password}
        )
        return response
    except Exception as e:
        raise HTTPException(status_code=401, detail="Authentication failed")


@app.post("/signout")
async def signout(_: Request):
    try:
        supabase.auth.sign_out()
        return {"message": "signed out"}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Authentication failed")


@app.get("/items")
async def get_items(_=Depends(verify_token)):
    try:
        data = supabase.table("items").select("*").execute()
    except APIError:
        raise HTTPException(status_code=400, detail=str("GET items failed"))
    return data


class ItemsBody(BaseModel):
    name: str
    description: str
    price: str


@app.post("/items")
async def add_items(request: Request, _=Depends(verify_token)):
    try:
        body_json = await request.json()
        body = ItemsBody(**body_json)
        item_body = body.model_dump()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid request body: {str(e)}")

    try:
        data = supabase.table("items").insert([item_body]).execute()
        return data
    except APIError as e:
        raise HTTPException(status_code=400, detail=f"POST item failed: {str(e)}")
