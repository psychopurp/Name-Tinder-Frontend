import regeneratorRuntime from '../../utils/regenerator-runtime'
import { setConfig, getConfig } from '../../utils/index'
import request from '../../utils/request'

const app = getApp()
Page({
  data: {
    gender: '',
    showOpenSettingButton: false,
    showGetUserInfoButton: false,
  },
  setUserConfig:function(e){
  

  },
  onChooseGender(e) {
    this.setData({
      gender: e.target.dataset.value,
    })
  },

  onChooseGenders (e) {
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
    let gender = this.data.gender
    let userConfig = {
      nameType: 0,
      gender: (this.data.gender == '0') ? 1 : 2,
      lastName: null,
      isDoubleName: null
    }
    app.setConfig(userConfig)
    app.setUserInfo(this.userInfo.userInfo)
    console.log('goto nameswipe.......')
    console.log(app.globalData)
    let config =userConfig
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

    wx.reLaunch({
      url: '/pages/name-swipe/index',
    })
  },

  bindGetUserInfo (e) {
    console.log('getUserInfo...........')
    console.log(e)
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
