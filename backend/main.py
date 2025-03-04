import os
from typing import Optional
from fastapi import Depends, FastAPI, HTTPException, Response
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
async def signin(request: Request, response: Response):
    body = SignInBody(**(await request.json()))

    try:
        supabase_response = supabase.auth.sign_in_with_password(
            {"email": body.email, "password": body.password}
        )

        if supabase_response.user:
            refresh_token = supabase_response.session.refresh_token
            access_token = supabase_response.session.access_token
            expires_at = supabase_response.session.expires_at
            expires_in = supabase_response.session.expires_in

            # Set refresh token in HttpOnly cookie
            response.set_cooki(
                key="refresh_token",
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite="strict",
            )
            response.status_code = 200

            return {
                "access_token": access_token,
                "expires_in": expires_in,
                "expires_at": expires_at,
            }
        else:
            response.status_code = 401
            return {"error": "Authentication failed"}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Authentication failed")


@app.post("/signout")
async def signout(_: Request, response: Response):
    try:
        supabase.auth.sign_out()
        response.delete_cookie("refresh_token")

        return {"message": "signed out"}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Authentication failed")


@app.post("/refresh")
async def refresh_token(request: Request, response: Response):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        response.status_code = 401
        return {"error": "No refresh token provided"}

    try:
        auth_response = supabase.auth.refresh_session(refresh_token)
        access_token = auth_response.session.access_token
        refresh_token = auth_response.session.refresh_token
        expires_at = auth_response.session.expires_at
        expires_in = auth_response.session.expires_in

        # Update refresh token cookie
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite="strict",
        )

        return {
            "access_token": access_token,
            "expires_at": expires_at,
            "expires_in": expires_in,
        }
    except Exception as e:
        response.status_code = 401
        return {"error": "Invalid or expired refresh token"}


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
