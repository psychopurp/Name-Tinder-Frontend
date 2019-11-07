import regeneratorRuntime from '../../utils/regenerator-runtime'
import { getConfig, setConfig } from '../../utils/index'
import request from '../../utils/request'

Page({
  data: {
    type: 0,
    typeRange: [
      '哈萨克语名',
      '中文名',
    ],
    gender: 0,
    genderRange: [
      '男生',
      '女生',
      '男生和女生',
    ],
    lastName: '',
    showButton: false,
  },

  onInput (e) {
    this.setData({
      lastName: e.detail.value,
    })
    this.judgeChange()
  },

  onShow () {
    this.config = getConfig()
    const { type, gender, lastName } = this.config
    this.setData({
      type: +type,
      gender: +gender,
      lastName: lastName || '',
    })
  },

  setDataP (data) {
    return new Promise(resolve => {
      this.setData(data, resolve)
    })
  },


  async bindTypeChange (e) {
    await this.setDataP({
      type: e.detail.value,
    })
    this.judgeChange()
  },

  async bindGenderChange (e) {
    await this.setDataP({
      gender: e.detail.value,
    })
    this.judgeChange()
  },

  judgeChange () {
    let showButton = false
    if (+this.data.type !== +this.config.type || +this.data.gender !== +this.config.gender) {
      showButton = true
    } else if (+this.data.type === 1 && this.data.lastName !== this.config.lastName) {
      showButton = true
    }

    this.setData({
      showButton,
    })
  },

  async onSave () {
    const {
      type,
      gender,
      lastName,
    } = this.data

    if (+type === 1 && !lastName) {
      wx.showToast({
        title: '中文名字需要输入姓',
        icon: 'none',
        duration: 1500,
        mask: true,
      })
      return
    }

    let config = getConfig()
    config = {
      type,
      gender,
      lastName,
    }

    setConfig(config)
    // console.log(getConfig(), 1111)

    try {
      await request({
        url: '/api/user/userinfo',
        method: 'PUT',
        data: {
          config,
        },
      })
    } catch (error) {
      console.log(error)
    }

    wx.switchTab({
      url: '/pages/name-swipe/index',
    })

    // wx.redirectTo({
    //   url: '/pages/name-swipe/index',
    // })
    // wx.navigateBack()
  },
})
