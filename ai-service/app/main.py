from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.recommendation_engine import recommend_products


class RecommendRequest(BaseModel):
    query: str = Field(min_length=1)


app = FastAPI(title="Shopping Guide AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}


@app.post("/ai/recommend")
def recommend(request: RecommendRequest) -> dict:
    return recommend_products(request.query.strip())
