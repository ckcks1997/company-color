import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import search
from dotenv import load_dotenv

# .env 환경변수 load
load_dotenv(dotenv_path="app/.env")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in os.getenv('ALLOW_ORIGINS', '').split(',')],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router)

@app.get("/")
async def root():
    return {"message": "Hello World"}

def start():
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

start()