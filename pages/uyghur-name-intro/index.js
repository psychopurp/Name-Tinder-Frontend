import regeneratorRuntime from '../../utils/regenerator-runtime'
import { setConfig, getConfig } from '../../utils/index'
import request from '../../utils/request'

Page({
  data: {
    gender: '',
    showOpenSettingButton: false,
    showGetUserInfoButton: false,
  },
  onChooseGender (e) {
    this.setData({
      gender: e.target.dataset.value,
    })

    const { showOpenSettingButton, showGetUserInfoButton } = this.data
    if (showOpenSettingButton || showGetUserInfoButton) {
      return
    }
    wx.getUserInfo({
      withCredentials: true,
      success: (res) => {
        this.userInfo = res
        this.goToNameSwipe()
      },
      fail: (res) => {
        console.log(e.detail.userInfo)
        console.error(res)
        if (res.errMsg.includes('getUserInfo:fail')) {
          this.setData({
            showOpenSettingButton: true,
          })
        }
      },
    })
  },
  async goToNameSwipe () {
    const { gender } = this.data

    let config = getConfig()
    config = {
      ...config,
      gender,
    }
    setConfig(config)

    try {
      await request({
        url: '/api/user/userinfo',
        method: 'PUT',
        data: {
          userInfo: this.userInfo,
          config,
        },
      })
    } catch (error) {
      console.log(error)
    }

    wx.switchTab({
      url: '/pages/name-swipe/index',
    })
  },
  bindGetUserInfo (e) {
    // 用户未同意授权
    if (!e.detail.userInfo) {
      this.setData({
        showGetUserInfoButton: true,
      })
    } else {
      this.userInfo = {
        userInfo: e.detail.userInfo,
      }
      this.goToNameSwipe()
    }
  },
  onShow () {
    wx.getSetting({
      success: (res) => {
        let showOpenSettingButton = false
        let showGetUserInfoButton = false
        // // 未调起授权
        // if (!res.authSetting.hasOwnProperty('scope.userInfo')) {
        //   showGetUserInfoButton = true
        // }
        // // 用户主动拒绝再次引导用户允许授权
        // if (res.authSetting['scope.userInfo'] === false) {
        //   showOpenSettingButton = true
        // }

        if (!res.authSetting['scope.userInfo']) {
          showGetUserInfoButton = true
        }

        this.setData({
          showOpenSettingButton,
          showGetUserInfoButton,
        })
      },
    })
  },
})
