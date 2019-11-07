import regeneratorRuntime from '../../utils/regenerator-runtime'
import request from '../../utils/request'
import { getConfig, handleAuthError } from '../../utils/index'

const app = getApp()

Page({
  data: {
    // list: [{
    //   avatar: '',
    //   name: '沙漠孤狼🏜',
    // }],
    list: null,
  },
  async onShow () {
    await this.getGroups()
    let shared = +wx.getStorageSync('user_like_times') === 1

    // 分享过了 数据被清除掉了
    if (!shared && this.data.list.length > 0) {
      wx.setStorageSync('user_like_times', 1)
      shared = true
    }
    if (shared) {
      wx.hideTabBarRedDot({
        index: 1,
      })
    }
  },
  setDataP (data) {
    return new Promise(resolve => {
      this.setData(data, resolve)
    })
  },
  async getUserInfo () {
    return new Promise((resolve) => {
      wx.getUserInfo({
        success: (res) => {
          this.userInfo = res
          resolve(res)
        },
        fail: (res) => {
          handleAuthError()
        },
      })
    })
  },
  onTapMatch (e) {
    wx.navigateTo({
      url: `/pages/likelist/index?groupId=${e.target.dataset.id}`,
    })
  },
  async onShare () {
    await this.creatGroup()
  },
  async getGroups () {
    const userInfo = await this.getUserInfo()

    await request({
      url: '/api/user/userinfo',
      method: 'PUT',
      data: {
        userInfo,
      },
    })

    const res = await request({
      url: '/api/groups',
    })
    // console.log(res)
    const { groups, selfGroupId } = res.data.data
    this.selfGroupId = selfGroupId
    this.setDataP({
      list: groups.map(group => {
        const { avatarUrl, nickName } = (group.displayUser || group.users[0])
        return ({
          avatar: avatarUrl,
          name: nickName,
          id: group.id,
        })
      }),
    })
  },
  onShareAppMessage () {
    const config = getConfig()
    wx.setStorageSync('user_like_times', 1)
    return {
      title: '和我一起给宝宝取个好听的名字吧。',
      path: `/pages/share/index?groupId=${this.selfGroupId}&config=${encodeURIComponent(JSON.stringify(config))}`,
      imageUrl: '../../assets/image/share_image.png',
    }
  },
})
