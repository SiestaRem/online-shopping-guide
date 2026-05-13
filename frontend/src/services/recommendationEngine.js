import { productCatalog } from '../data/products'

const DEFAULT_BUDGET = 9999

const intentRules = [
  { keywords: ['跑步', '运动', '运动鞋'], scene: '运动', category: '跑步', style: '运动' },
  { keywords: ['面试', '通勤', '上班', '简约'], scene: '面试', category: '通勤', style: '简约' }
]

export const recommendProducts = (query) => {
  const intent = parseIntent(query)
  const recalled = recallCandidates(intent)
  const filtered = recalled.filter((product) => product.stock > 0 && product.price <= intent.budget)
  const ranked = filtered
    .map((product) => ({ ...product, score: scoreProduct(product, intent) }))
    .sort((left, right) => right.score - left.score)

  return {
    intent,
    analysisSummary: formatAnalysisSummary(intent),
    retrievalSummary: `召回 ${recalled.length} 个候选，过滤 ${recalled.length - filtered.length} 个不匹配商品`,
    products: ranked.map(toDisplayProduct),
    explainSteps: buildExplainSteps(intent, ranked)
  }
}

const parseIntent = (query) => {
  const budget = parseBudget(query)
  const matchedRule = intentRules.find((rule) => rule.keywords.some((keyword) => query.includes(keyword))) ?? intentRules[1]

  return {
    rawQuery: query,
    budget,
    scene: matchedRule.scene,
    category: matchedRule.category,
    style: matchedRule.style,
    keywords: extractKeywords(query, matchedRule)
  }
}

const parseBudget = (query) => {
  const match = query.match(/(?:预算|价格)?\s*(\d+)\s*(?:元)?\s*(?:以内|以下|内)?/)
  return match ? Number(match[1]) : DEFAULT_BUDGET
}

const extractKeywords = (query, rule) => {
  const queryKeywords = rule.keywords.filter((keyword) => query.includes(keyword))
  return [...new Set([rule.scene, rule.category, rule.style, ...queryKeywords])]
}

const recallCandidates = (intent) => productCatalog.filter((product) => {
  const allTags = [...product.sceneTags, ...product.styleTags, ...product.searchTags, product.name, product.category]
  return intent.keywords.some((keyword) => allTags.some((tag) => tag.includes(keyword) || keyword.includes(tag)))
})

const scoreProduct = (product, intent) => {
  const semanticScore = tagMatchScore(product, intent.keywords)
  const exactNeedScore = exactNeedMatchScore(product, intent.rawQuery)
  const budgetScore = product.price <= intent.budget ? 1 - product.price / Math.max(intent.budget, product.price) * 0.35 : 0
  const sceneScore = product.sceneTags.includes(intent.scene) ? 1 : 0.35
  const ratingScore = product.rating / 5
  const stockScore = Math.min(product.stock / 40, 1)

  return Math.round((semanticScore * 0.35 + exactNeedScore * 0.2 + budgetScore * 0.15 + sceneScore * 0.15 + ratingScore * 0.1 + stockScore * 0.05) * 100)
}

const tagMatchScore = (product, keywords) => {
  const allTags = [...product.sceneTags, ...product.styleTags, ...product.searchTags, product.name, product.category]
  const matchedCount = keywords.filter((keyword) => allTags.some((tag) => tag.includes(keyword) || keyword.includes(tag))).length
  return Math.min(matchedCount / Math.max(keywords.length, 1), 1)
}

const exactNeedMatchScore = (product, query) => {
  const highIntentFields = [product.name, product.category, ...product.searchTags]
  const matchedCount = highIntentFields.filter((field) => query.includes(field) || field.includes(query)).length
  return Math.min(matchedCount / 2, 1)
}

const toDisplayProduct = (product) => ({
  id: product.id,
  skuId: product.skuId,
  category: product.category,
  coverText: product.coverText,
  name: product.name,
  price: product.price,
  stock: product.stock,
  score: product.score,
  summary: product.summary,
  tags: buildDisplayTags(product)
})

const buildDisplayTags = (product) => {
  const tags = ['预算内', ...product.sceneTags.slice(0, 1), ...product.styleTags.slice(0, 1)]
  if (product.stock > 20) {
    tags.push('库存充足')
  }
  return tags
}

const buildExplainSteps = (intent, products) => [
  {
    title: '意图解析',
    detail: `识别出预算 ${intent.budget} 元以内、${intent.scene} 场景和${intent.style}偏好。`
  },
  {
    title: '混合检索',
    detail: `根据 ${intent.keywords.join(' / ')} 召回商品，并过滤无库存和超预算商品。`
  },
  {
    title: '可解释排序',
    detail: products[0]
      ? `首推 ${products[0].name}，因为它预算内、标签匹配且库存可售。`
      : '暂无符合预算和库存条件的商品。'
  }
]

const formatAnalysisSummary = (intent) => `已解析：${intent.scene} / ${intent.category} / 预算 ${intent.budget} 元以内`
