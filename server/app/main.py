from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.middlewares.authentication import AuthenticationMiddleware
from app.middlewares.response_encoder import ResponseEncoderMiddleware
from app.routes import auth, processes, ticks
from app.services.env import SESSION_SECRET

# BaseModel.model_config["json_encoders"] = {ObjectId: lambda x: str(x)}
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
app.add_middleware(ResponseEncoderMiddleware)


app.include_router(auth.router)
app.include_router(ticks.router)
app.include_router(processes.router)


@app.get("/")
def root():
    return {"message": "Welcome to Ka-ching!"}
