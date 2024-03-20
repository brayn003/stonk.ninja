from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.middlewares.authentication import AuthenticationMiddleware
from app.routes import auth
from app.services.env import SESSION_SECRET

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(AuthenticationMiddleware)
app.add_middleware(SessionMiddleware, secret_key=SESSION_SECRET)


app.include_router(auth.router)


@app.get("/")
def root():
    return {"message": "Welcome to stonk.ninja"}
