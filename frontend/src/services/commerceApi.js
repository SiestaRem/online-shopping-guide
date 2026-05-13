const COMMERCE_API_BASE_URL = import.meta.env.VITE_COMMERCE_API_URL ?? 'http://localhost:8080'

export const addCartItem = async ({ skuId, quantity }) => {
  const response = await fetch(`${COMMERCE_API_BASE_URL}/api/cart/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ skuId, quantity })
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: `加购失败：${response.status}` }))
    throw new Error(errorBody.message)
  }

  return await response.json()
}

export const previewOrder = async () => {
  const response = await fetch(`${COMMERCE_API_BASE_URL}/api/orders/preview`, {
    method: 'POST'
  })

  if (!response.ok) {
    throw new Error(`订单预览失败：${response.status}`)
  }

  return await response.json()
}
