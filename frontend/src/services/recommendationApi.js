import { recommendProducts } from './recommendationEngine'

const API_BASE_URL = import.meta.env.VITE_AI_SERVICE_URL ?? 'http://localhost:8000'

export const fetchRecommendations = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    })

    if (!response.ok) {
      throw new Error(`AI recommendation request failed: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`[AI_RECOMMENDATION_FALLBACK] ${new Date().toISOString()} fetchRecommendations failed`, error)
    return recommendProducts(query)
  }
}
