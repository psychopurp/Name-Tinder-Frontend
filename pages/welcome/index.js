import { setConfig, getConfig } from '../../utils/index'

const URL_MAP = [
  '/pages/uyghur-name-intro/index',
  '/pages/han-name-intro/index',
]

Page({
  data: {
    showOpenSettingButton: false,
    loading: true,
  },

  onJump (event) {
    wx.getLocation({
      type: 'wgs84',
      success (res) {
        // const latitude = res.latitude
        // const longitude = res.longitude
        // const speed = res.speed
        // const accuracy = res.accuracy
        const type = event.currentTarget.dataset.type
        let config = getConfig()
        setConfig({
          ...config,
          type,
        })
        wx.reLaunch({
          url: URL_MAP[type],
        })
      },
      fail: (res) => {
        console.error(res.errMsg)
        if (res.errMsg.includes('getLocation:fail auth deny')) {
          this.setData({
            showOpenSettingButton: true,
          })
        }
      },
    })
  },
  onShow () {
    const config = getConfig()
    // if (config.hasOwnProperty('type') && config.hasOwnProperty('gender')) {
    //   wx.switchTab({
    //     url: '/pages/name-swipe/index',
    //   })
    //   return
    // }
    this.setData({
      loading: false,
    })
    wx.getSetting({
      success: (res) => {
        let showOpenSettingButton = false

        // 用户主动拒绝再次引导用户允许授权
        if (res.authSetting['scope.userLocation'] === false) {
          showOpenSettingButton = true
        }

        this.setData({
          showOpenSettingButton,
        })
      },
    })
  },
})
