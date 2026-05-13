import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchRecommendations } from '../services/recommendationApi'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('recommendationApi', () => {
  it('returns API recommendations when FastAPI responds successfully', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ products: [{ name: '接口返回商品' }] })
    })

    const result = await fetchRecommendations('预算 500，跑步鞋')

    expect(result.products[0].name).toBe('接口返回商品')
  })

  it('falls back to local recommendation when API is unavailable', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network error'))

    const result = await fetchRecommendations('预算 500，想买适合跑步的运动鞋')

    expect(result.products[0].name).toBe('缓震透气跑步鞋')
  })
})
