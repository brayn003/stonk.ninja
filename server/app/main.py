from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.middlewares.auth_session import AuthSessionMiddleware
from app.routes import auth, session, ticks
from app.services.env import SESSION_SECRET

app = FastAPI(redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(AuthSessionMiddleware)
app.add_middleware(SessionMiddleware, secret_key=SESSION_SECRET)


app.include_router(auth.router)
app.include_router(session.router)
app.include_router(ticks.router)


@app.get("/")
def root():
    return {"message": "Welcome to stonk.ninja"}
