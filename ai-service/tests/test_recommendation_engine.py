from app.recommendation_engine import recommend_products


def test_recommends_running_shoes_for_sports_query_under_budget():
    result = recommend_products("预算 500，想买适合跑步的运动鞋")

    assert result["analysisSummary"] == "已解析：运动 / 跑步 / 预算 500 元以内"
    assert result["products"][0]["name"] == "缓震透气跑步鞋"
    assert result["products"][0]["price"] <= 500


def test_filters_unavailable_and_over_budget_products_before_ranking():
    result = recommend_products("预算 300，适合面试的简约通勤穿搭")

    assert all(product["stock"] > 0 for product in result["products"])
    assert all(product["price"] <= 300 for product in result["products"])
    assert result["products"][0]["name"] == "简约通勤白衬衫"


def test_returns_explainable_summaries_for_frontend_display():
    result = recommend_products("预算 300，适合面试的简约通勤穿搭")

    assert "召回" in result["retrievalSummary"]
    assert len(result["explainSteps"]) == 3
    assert "预算内" in result["explainSteps"][2]["detail"]
