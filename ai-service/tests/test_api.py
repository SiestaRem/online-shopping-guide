from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_recommend_api_returns_ranked_products():
    response = client.post("/ai/recommend", json={"query": "预算 500，想买适合跑步的运动鞋"})

    assert response.status_code == 200
    body = response.json()
    assert body["analysisSummary"] == "已解析：运动 / 跑步 / 预算 500 元以内"
    assert body["products"][0]["name"] == "缓震透气跑步鞋"


def test_recommend_api_rejects_empty_query():
    response = client.post("/ai/recommend", json={"query": ""})

    assert response.status_code == 422
