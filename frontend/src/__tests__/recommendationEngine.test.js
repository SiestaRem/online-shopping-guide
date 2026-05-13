import { describe, expect, it } from 'vitest'
import { recommendProducts } from '../services/recommendationEngine'

describe('recommendationEngine', () => {
  it('recommends running shoes for a sports query under budget', () => {
    const result = recommendProducts('预算 500，想买适合跑步的运动鞋')

    expect(result.analysisSummary).toBe('已解析：运动 / 跑步 / 预算 500 元以内')
    expect(result.products[0].name).toBe('缓震透气跑步鞋')
    expect(result.products[0].price).toBeLessThanOrEqual(500)
  })

  it('filters unavailable and over-budget products before ranking', () => {
    const result = recommendProducts('预算 300，适合面试的简约通勤穿搭')

    expect(result.products.every((product) => product.stock > 0)).toBe(true)
    expect(result.products.every((product) => product.price <= 300)).toBe(true)
    expect(result.products[0].name).toBe('简约通勤白衬衫')
  })

  it('returns explainable summaries for frontend display', () => {
    const result = recommendProducts('预算 300，适合面试的简约通勤穿搭')

    expect(result.retrievalSummary).toContain('召回')
    expect(result.explainSteps).toHaveLength(3)
    expect(result.explainSteps[2].detail).toContain('预算内')
  })
})
