import regeneratorRuntime from '../../utils/regenerator-runtime'

import { setConfig, getConfig } from '../../utils/index'
import request from '../../utils/request'

Page({
  data: {
    name: '',
    gender: '',
    showOpenSettingButton: false,
    showGetUserInfoButton: false,
  },
  onInput (e) {
    this.setData({
      name: e.detail.value,
    })
  },
  onChooseGender (e) {
    this.setData({
      gender: e.target.dataset.value,
    })
  },
  next () {
    const { showOpenSettingButton, showGetUserInfoButton } = this.data
    if (showOpenSettingButton || showGetUserInfoButton) {
      return
    }
    wx.getUserInfo({
      success: (res) => {
        // const userInfo = res.userInfo
        // const nickName = userInfo.nickName
        // const avatarUrl = userInfo.avatarUrl
        // const gender = userInfo.gender // 性别 0：未知、1：男、2：女
        // const province = userInfo.province
        // const city = userInfo.city
        // const country = userInfo.country
        this.userInfo = res
        this.goToNameSwipe()
      },
      fail: (res) => {
        console.error(res)
        if (res.errMsg.includes('getUserInfo:fail')) {
          this.setData({
            showOpenSettingButton: true,
          })
        }
      },
    })
  },
  bindGetUserInfo (e) {
    // 用户未同意授权
    if (!e.detail.userInfo) {
      this.setData({
        showGetUserInfoButton: true,
      })
    } else {
      this.goToNameSwipe()
    }
  },
  async goToNameSwipe () {
    // const type = event.currentTarget.dataset.type
    const { gender, name } = this.data
    let config = getConfig()
    config = {
      ...config,
      gender,
      lastName: name,
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
  onShow () {
    wx.getSetting({
      success: (res) => {
        console.log(res)

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
