import { flushPromises, mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ShoppingGuideHome from '../components/ShoppingGuideHome.vue'
import { recommendProducts } from '../services/recommendationEngine'

const mountPage = () => mount(ShoppingGuideHome, {
  global: {
    plugins: [ElementPlus]
  }
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ShoppingGuideHome', () => {
  it('renders the intelligent shopping guide landing page', () => {
    const wrapper = mountPage()

    expect(wrapper.text()).toContain('多模态电商智能导购 Agent')
    expect(wrapper.text()).toContain('输入你的需求')
    expect(wrapper.text()).toContain('推荐商品')
    expect(wrapper.text()).toContain('为什么推荐')
    expect(wrapper.text()).toContain('后续适配抖音小程序、React Web 与原生 App')
  })

  it('shows demo recommendations with explainable matching labels', () => {
    const wrapper = mountPage()

    expect(wrapper.text()).toContain('简约通勤白衬衫')
    expect(wrapper.text()).toContain('预算内')
    expect(wrapper.text()).toContain('库存充足')
  })

  it('updates recommendation context after generating a sports query', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => recommendProducts('预算 500，想买适合跑步的运动鞋')
    })
    const wrapper = mountPage()

    await wrapper.find('textarea').setValue('预算 500，想买适合跑步的运动鞋')
    const generateButton = wrapper.findAll('button').find((button) => button.text().includes('生成推荐'))
    await generateButton.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('已解析：运动 / 跑步 / 预算 500 元以内')
    expect(wrapper.text()).toContain('召回')
    expect(wrapper.text()).toContain('过滤')
    expect(wrapper.text()).toContain('缓震透气跑步鞋')
  })

  it('updates cart preview after adding a recommended product', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        itemCount: 1,
        totalAmount: 199,
        items: [{ skuId: 1001, name: '简约通勤白衬衫', price: 199, quantity: 1, amount: 199 }]
      })
    })
    const wrapper = mountPage()

    const addButton = wrapper.findAll('button').find((button) => button.text().includes('加入购物车'))
    await addButton.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('购物车 1 件')
    expect(wrapper.text()).toContain('结算预览：¥199')
  })

  it('renders recommendation score and reserved API contract for iteration', () => {
    const wrapper = mountPage()

    expect(wrapper.text()).toContain('匹配度')
    expect(wrapper.text()).toContain('接口预留：POST /ai/recommend')
    expect(wrapper.text()).toContain('演示流程看板')
  })

  it('renders Douyin commerce style conversion sections', () => {
    const wrapper = mountPage()

    expect(wrapper.text()).toContain('爆款推荐')
    expect(wrapper.text()).toContain('低价好物')
    expect(wrapper.text()).toContain('图片找同款')
    expect(wrapper.text()).toContain('AI 导购解释')
  })
})
