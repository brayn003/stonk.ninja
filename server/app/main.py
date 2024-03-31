from contextlib import asynccontextmanager

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.middlewares.auth_session import AuthSessionMiddleware
from app.models.integration import IntegrationManager
from app.routes import auth, integration_routes, session, ticks
from app.services.env import SESSION_SECRET


@asynccontextmanager
async def lifespan(app: FastAPI):
    await IntegrationManager.load_all_integrations()
    yield


app = FastAPI(lifespan=lifespan, redirect_slashes=False)

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
app.include_router(integration_routes.router)


@app.get("/")
def root():
    return {"message": "Welcome to stonk.ninja"}
