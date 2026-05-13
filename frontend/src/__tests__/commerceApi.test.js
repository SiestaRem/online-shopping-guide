import { afterEach, describe, expect, it, vi } from 'vitest'
import { addCartItem } from '../services/commerceApi'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('commerceApi', () => {
  it('adds a sku to cart through Java backend', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ itemCount: 1, totalAmount: 199 })
    })

    const result = await addCartItem({ skuId: 1001, quantity: 1 })

    expect(result.itemCount).toBe(1)
    expect(result.totalAmount).toBe(199)
  })

  it('throws backend error message when add cart fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'SKU 库存不足' })
    })

    await expect(addCartItem({ skuId: 1006, quantity: 1 })).rejects.toThrow('SKU 库存不足')
  })
})
