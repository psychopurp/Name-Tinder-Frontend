
import regeneratorRuntime from '../../utils/regenerator-runtime'
import { getConfig, setConfig } from '../../utils/index'
import request from '../../utils/request'

const app = getApp()

Page({
  data: {
    userInfo: {},
    showGetUserInfoButton: false,
  },
  async onLoad (query) {
    const { config, groupId } = query
    this.groupId = groupId
    this.config = JSON.parse(decodeURIComponent(config))
    setConfig({
      ...getConfig(),
      ...this.config,
    })
    await app.globalData.userInfoPromise
    this.getGroupDetail(groupId)
  },
  onClick () {
    const { showGetUserInfoButton } = this.data
    if (showGetUserInfoButton) {
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
  async goToNameSwipe () {
    try {
      const results = await Promise.all([
        request({
          url: '/api/user/userinfo',
          method: 'PUT',
          data: {
            userInfo: this.userInfo,
            config: this.config,
          },
        }),
        request({
          url: `/api/group/join?id=${this.groupId}`,
        }),
      ])
      console.log(results[1])
      // return
      // 组满了
      if (results[1].data.code === 200001) {
        wx.showToast({
          title: '已经有人帮他选名字啦~即将跳转到首页~',
          icon: 'none',
          duration: 1500,
          mask: true,
        })
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/welcome/index',
          })
        }, 1500)
        return
      }
      wx.switchTab({
        url: '/pages/name-swipe/index',
      })
    } catch (error) {
      console.log(error)
    }
  },
  async getGroupDetail (id) {
    const res = await request({
      url: `/api/group/${id}`,
    })
    console.log('groupId:', id)
    if (!res.data.data) {
      // return;
      wx.showToast({
        title: '已经有人帮他选名字啦~即将跳转到首页~',
        icon: 'none',
        duration: 1500,
        mask: true,
      })
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/welcome/index',
        })
      }, 1500)
      return
    }
    this.creatorUserInfo = res.data.data.users.filter((user) => user.creator)[0]
    console.log(this.creatorUserInfo, res.data.data.users)
    this.setData({
      userInfo: this.creatorUserInfo,
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
