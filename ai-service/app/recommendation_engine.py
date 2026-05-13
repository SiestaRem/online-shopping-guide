import re

from app.products import PRODUCT_CATALOG

DEFAULT_BUDGET = 9999

INTENT_RULES = [
    {"keywords": ["跑步", "运动", "运动鞋"], "scene": "运动", "category": "跑步", "style": "运动"},
    {"keywords": ["面试", "通勤", "上班", "简约"], "scene": "面试", "category": "通勤", "style": "简约"},
]


def recommend_products(query: str) -> dict:
    intent = parse_intent(query)
    recalled = recall_candidates(intent)
    filtered = [product for product in recalled if product["stock"] > 0 and product["price"] <= intent["budget"]]
    ranked = sorted(
        [{**product, "score": score_product(product, intent)} for product in filtered],
        key=lambda product: product["score"],
        reverse=True,
    )

    return {
        "intent": intent,
        "analysisSummary": format_analysis_summary(intent),
        "retrievalSummary": f"召回 {len(recalled)} 个候选，过滤 {len(recalled) - len(filtered)} 个不匹配商品",
        "products": [to_display_product(product) for product in ranked],
        "explainSteps": build_explain_steps(intent, ranked),
    }


def parse_intent(query: str) -> dict:
    budget = parse_budget(query)
    matched_rule = next(
        (rule for rule in INTENT_RULES if any(keyword in query for keyword in rule["keywords"])),
        INTENT_RULES[1],
    )

    return {
        "rawQuery": query,
        "budget": budget,
        "scene": matched_rule["scene"],
        "category": matched_rule["category"],
        "style": matched_rule["style"],
        "keywords": extract_keywords(query, matched_rule),
    }


def parse_budget(query: str) -> int:
    match = re.search(r"(?:预算|价格)?\s*(\d+)\s*(?:元)?\s*(?:以内|以下|内)?", query)
    return int(match.group(1)) if match else DEFAULT_BUDGET


def extract_keywords(query: str, rule: dict) -> list[str]:
    query_keywords = [keyword for keyword in rule["keywords"] if keyword in query]
    return list(dict.fromkeys([rule["scene"], rule["category"], rule["style"], *query_keywords]))


def recall_candidates(intent: dict) -> list[dict]:
    return [product for product in PRODUCT_CATALOG if product_matches_intent(product, intent)]


def product_matches_intent(product: dict, intent: dict) -> bool:
    all_tags = [*product["sceneTags"], *product["styleTags"], *product["searchTags"], product["name"], product["category"]]
    return any(keyword in tag or tag in keyword for keyword in intent["keywords"] for tag in all_tags)


def score_product(product: dict, intent: dict) -> int:
    semantic_score = tag_match_score(product, intent["keywords"])
    exact_need_score = exact_need_match_score(product, intent["rawQuery"])
    budget_score = 1 - product["price"] / max(intent["budget"], product["price"]) * 0.35
    scene_score = 1 if intent["scene"] in product["sceneTags"] else 0.35
    rating_score = product["rating"] / 5
    stock_score = min(product["stock"] / 40, 1)

    return round(
        (
            semantic_score * 0.35
            + exact_need_score * 0.2
            + budget_score * 0.15
            + scene_score * 0.15
            + rating_score * 0.1
            + stock_score * 0.05
        )
        * 100
    )


def tag_match_score(product: dict, keywords: list[str]) -> float:
    all_tags = [*product["sceneTags"], *product["styleTags"], *product["searchTags"], product["name"], product["category"]]
    matched_count = sum(1 for keyword in keywords if any(keyword in tag or tag in keyword for tag in all_tags))
    return min(matched_count / max(len(keywords), 1), 1)


def exact_need_match_score(product: dict, query: str) -> float:
    high_intent_fields = [product["name"], product["category"], *product["searchTags"]]
    matched_count = sum(1 for field in high_intent_fields if field in query or query in field)
    return min(matched_count / 2, 1)


def to_display_product(product: dict) -> dict:
    return {
        "id": product["id"],
        "skuId": product["skuId"],
        "category": product["category"],
        "coverText": product["coverText"],
        "name": product["name"],
        "price": product["price"],
        "stock": product["stock"],
        "score": product["score"],
        "summary": product["summary"],
        "tags": build_display_tags(product),
    }


def build_display_tags(product: dict) -> list[str]:
    tags = ["预算内", *product["sceneTags"][:1], *product["styleTags"][:1]]
    if product["stock"] > 20:
        tags.append("库存充足")
    return tags


def build_explain_steps(intent: dict, products: list[dict]) -> list[dict]:
    return [
        {
            "title": "意图解析",
            "detail": f"识别出预算 {intent['budget']} 元以内、{intent['scene']} 场景和{intent['style']}偏好。",
        },
        {
            "title": "混合检索",
            "detail": f"根据 {' / '.join(intent['keywords'])} 召回商品，并过滤无库存和超预算商品。",
        },
        {
            "title": "可解释排序",
            "detail": f"首推 {products[0]['name']}，因为它预算内、标签匹配且库存可售。" if products else "暂无符合预算和库存条件的商品。",
        },
    ]


def format_analysis_summary(intent: dict) -> str:
    return f"已解析：{intent['scene']} / {intent['category']} / 预算 {intent['budget']} 元以内"
