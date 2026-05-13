<template>
  <main class="guide-page douyin-commerce">
    <section class="hero-shell">
      <nav class="top-bar">
        <div class="brand-mark">AI 导购</div>
        <div class="trend-tabs">
          <span>爆款推荐</span>
          <span>低价好物</span>
          <span>穿搭灵感</span>
        </div>
        <el-tag effect="dark" type="danger">抖音电商风</el-tag>
      </nav>

      <div class="hero-grid">
        <div class="hero-copy">
          <el-tag class="hot-tag" effect="dark">多模态电商智能导购 Agent</el-tag>
          <h1>像刷短视频一样，快速找到适合你的商品</h1>
          <p>
            输入预算、场景和偏好，或者上传参考图片，AI 会给出商品卡片、匹配度和推荐理由。
          </p>
          <div class="hero-metrics">
            <div>
              <strong>86%</strong>
              <span>首推匹配度</span>
            </div>
            <div>
              <strong>10</strong>
              <span>候选召回</span>
            </div>
            <div>
              <strong>3</strong>
              <span>无效过滤</span>
            </div>
          </div>
        </div>

        <el-card class="query-card" shadow="always">
          <template #header>
            <div class="card-title">输入你的需求</div>
          </template>
          <el-input
            v-model="query"
            :rows="5"
            type="textarea"
            placeholder="例如：预算 300 元以内，想要适合面试的简约通勤穿搭"
          />
          <div class="query-actions">
            <el-upload action="#" :auto-upload="false" :show-file-list="false">
              <el-button class="ghost-button">图片找同款</el-button>
            </el-upload>
            <el-button class="primary-glow" type="primary" :loading="isLoading" @click="handleGenerate">生成推荐</el-button>
          </div>
        </el-card>
      </div>
    </section>

    <section class="status-strip">
      <el-card shadow="never">
        <span>意图解析</span>
        <strong>{{ analysisSummary }}</strong>
      </el-card>
      <el-card shadow="never">
        <span>召回过滤</span>
        <strong>{{ retrievalSummary }}</strong>
      </el-card>
      <el-card shadow="never">
        <span>购物车</span>
        <strong>购物车 {{ cartCount }} 件 · 结算预览：¥{{ cartTotal }}</strong>
      </el-card>
    </section>

    <section class="main-grid">
      <div class="recommend-panel">
        <div class="section-heading">
          <div>
            <span>FOR YOU</span>
            <h2>推荐商品</h2>
          </div>
          <el-tag type="danger" effect="dark">低价好物</el-tag>
        </div>

        <div class="product-list">
          <article v-for="product in products" :key="product.id" class="product-card">
            <div class="product-cover">
              <span>{{ product.category }}</span>
              <strong>{{ product.coverText }}</strong>
            </div>
            <div class="product-body">
              <div class="product-main">
                <h3>{{ product.name }}</h3>
                <strong>¥{{ product.price }}</strong>
              </div>
              <p>{{ product.summary }}</p>
              <div class="score-row">
                <span>匹配度 {{ product.score }}%</span>
                <el-progress :percentage="product.score" :stroke-width="9" :show-text="false" />
              </div>
              <div class="tag-row">
                <el-tag v-for="tag in product.tags" :key="tag" size="small" effect="dark">{{ tag }}</el-tag>
              </div>
              <el-button class="buy-button" type="danger" @click="addToCart(product)">加入购物车</el-button>
            </div>
          </article>
        </div>
      </div>

      <aside class="insight-panel">
        <el-card class="explain-card" shadow="always">
          <template #header>
            <div class="card-title">AI 导购解释 · 为什么推荐</div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="step in explainSteps"
              :key="step.title"
              :timestamp="step.title"
              placement="top"
            >
              {{ step.detail }}
            </el-timeline-item>
          </el-timeline>
        </el-card>

        <el-card class="demo-board" shadow="always">
          <h2>演示流程看板</h2>
          <p>接口预留：POST /ai/recommend，后续替换当前本地模拟推荐结果。</p>
          <div class="demo-steps">
            <span v-for="step in demoSteps" :key="step">{{ step }}</span>
          </div>
        </el-card>
      </aside>
    </section>

    <section class="roadmap-panel">
      <el-alert
        title="后续适配抖音小程序、React Web 与原生 App"
        type="info"
        :closable="false"
        show-icon
      />
      <div class="roadmap-grid">
        <el-card v-for="item in roadmap" :key="item.title" shadow="never">
          <h3>{{ item.title }}</h3>
          <p>{{ item.detail }}</p>
        </el-card>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { recommendProducts } from '../services/recommendationEngine'
import { fetchRecommendations } from '../services/recommendationApi'
import { addCartItem } from '../services/commerceApi'

const query = ref('预算 300 元以内，适合面试的简约通勤穿搭')
const isLoading = ref(false)
const recommendationResult = ref(recommendProducts(query.value))
const analysisSummary = computed(() => recommendationResult.value.analysisSummary)
const retrievalSummary = computed(() => recommendationResult.value.retrievalSummary)
const products = computed(() => recommendationResult.value.products)
const explainSteps = computed(() => recommendationResult.value.explainSteps)
const cartItems = ref([])
const cartCount = computed(() => cartItems.value.length)
const cartTotal = computed(() => cartItems.value.reduce((total, item) => total + item.price, 0))

const addToCart = async (product) => {
  try {
    const cartSummary = await addCartItem({ skuId: product.skuId, quantity: 1 })
    cartItems.value = cartSummary.items.map((item) => ({
      ...item,
      price: Number(item.price)
    }))
    return
  } catch (error) {
    console.error(`[CART_FALLBACK] ${new Date().toISOString()} addToCart failed`, error)
  }

  cartItems.value.push(product)
}

const handleGenerate = async () => {
  isLoading.value = true
  try {
    recommendationResult.value = await fetchRecommendations(query.value)
  } finally {
    isLoading.value = false
  }
}

const demoSteps = ['输入需求', '解析意图', '混合检索', '解释推荐', '加购结算']

const roadmap = [
  {
    title: '抖音适配',
    detail: '后期抽离页面数据模型，迁移到抖音小程序组件和端能力。'
  },
  {
    title: 'React Web',
    detail: '复用推荐接口和展示协议，使用 React 重写 Web 端。'
  },
  {
    title: 'App 原生',
    detail: '保留业务 API，后续接入图片拍摄、推送和原生支付能力。'
  }
]
</script>
