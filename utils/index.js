import request from './request'

export const getConfig = () => JSON.parse(wx.getStorageSync('user_config') || '{}')

export const setConfig = (config = {}) => {
  // const c = getConfig()
  wx.setStorageSync('user_config', JSON.stringify({
    // ...c,
    ...config,
  }))
}

export const handleAuthError = async () => {
  setConfig({})
  wx.showToast({
    title: '微信授权已失效~即将跳转到首页~',
    icon: 'none',
    duration: 1500,
    mask: true,
  })
  setTimeout(() => {
    wx.navigateTo({
      url: '/pages/welcome/index',
    })
  }, 1500)
}
