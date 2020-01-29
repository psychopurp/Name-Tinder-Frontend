import regeneratorRuntime from '../../utils/regenerator-runtime'

import {
  setConfig,
  getConfig
} from '../../utils/index'
import request from '../../utils/request'
const app = getApp()
Page({
  data: {
    name: '',
    gender: '',
    nameCount: '',
    showOpenSettingButton: false,
    fromFriend:false,
    friendInfo:null,
    showGetUserInfoButton: false,
  },
  onInput(e) {
    this.name = e.detail.value

    this.setData({
      name: e.detail.value,
    })
  },
  onChooseGender(e) {
    this.setData({
      gender: e.target.dataset.value,
    })
  },
  onChooseNameCount: function(e) {
    this.setData({
      nameCount: e.target.dataset.value,
    })
  },

  setUserConfig: function() {
    let str = /[\u4e00-\u9fa5]/
    console.log(this.name)
    if (!str.test(this.name)) {
      wx.showModal({
        title: '提示',
        content: '请输入正确的姓！',
        success: res => {
          if (res.confirm) {
            console.log('用户点击确定')
            this.setData({
              name: ''
            })
          }
        }
      })
      return false
    } else {
      let userConfig = {
        nameType: 1,
        gender: (this.data.gender == '0') ? 1 : 2,
        lastName: this.data.name,
        isDoubleName: (this.data.nameCount == '0') ? false : true
      }
      app.setConfig(userConfig)
      this.config = userConfig
      return true
    }


  },

  next() {
    const {
      showOpenSettingButton,
      showGetUserInfoButton
    } = this.data
    if (showOpenSettingButton || showGetUserInfoButton) {
      return
    }
    wx.getUserInfo({
      success: (res) => {
        this.userInfo = res.userInfo
        app.setUserInfo(this.userInfo)
        console.log(this.userInfo)
        this.setUserConfig()
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

  bindGetUserInfo(e) {
    console.log('bindGetUserInfo')
    // 用户未同意授权
    if (!e.detail.userInfo) {
      this.setData({
        showGetUserInfoButton: true,
      })
    } else {
      this.userInfo = {
        userInfo: e.detail.userInfo,
      }
      // console.log(this.userInfo)
      this.goToNameSwipe()
    }
  },

  async goToNameSwipe() {

    let configed = this.setUserConfig()
    if (configed) {
      try {
        await request({
          url: '/api/user/userinfo',
          method: 'PUT',
          data: {
            userInfo: this.userInfo,
            config:this.config
          },
        })
        if(this.data.fromFriend){
        let status = await request({
          url:'/api/addFriend',
          method:'POST',
          data:{
            userId:this.friendInfo.userId
          }
        })
        console.log(status)}
      } catch (error) {
        console.log(error)
      }

      wx.reLaunch({
        url: '../../pages/name-swipe/index',
      })
    }
  },

  onLoad(e){
    console.log(e)
    if(e.userInfo!=null){
      this.friendInfo=(JSON.parse(decodeURIComponent(e.userInfo)))
      console.log(this.friendInfo)
      this.name=e.lastName
      this.setData({name:e.lastName,fromFriend:true,friendInfo:this.friendInfo})
    }
  },

  onShow() {

    // wx.getSetting({
    //   success: (res) => {
    //     console.log(res)

    //     let showOpenSettingButton = false
    //     let showGetUserInfoButton = false
    //     // // 未调起授权
    //     // if (!res.authSetting.hasOwnProperty('scope.userInfo')) {
    //     //   showGetUserInfoButton = true
    //     // }
    //     // // 用户主动拒绝再次引导用户允许授权
    //     // if (res.authSetting['scope.userInfo'] === false) {
    //     //   showOpenSettingButton = true
    //     // }

    //     if (!res.authSetting['scope.userInfo']) {
    //       showGetUserInfoButton = true
    //     }

    //     this.setData({
    //       showOpenSettingButton,
    //       showGetUserInfoButton,
    //     })
    //   },
    // })
  },
})