import regeneratorRuntime from './utils/regenerator-runtime'
import request from './utils/request'
import { setConfig, getConfig } from './utils/index'

// 检查session_key是否失效
const checkSession = () => {
  return new Promise((resolve) => {
    wx.checkSession({
      success () {
        resolve(true)
      },
      fail () {
        resolve(false)
      },
    })
  })
}

// 登录处理
const login = () => new Promise((resolve, reject) => {
  wx.login({
    async success (res) {
      if (!res.code) {
        reject()
        return
      }

      // 获取我们自己服务器的登录 session
      const loginRes = await request({
        url: '/api/user/wx-login',
        data: {
          code: res.code,
        },
      })

      const { data, header } = loginRes
      // console.log(data, header)
      if (data.status === 200) {
        // this.globalData.sessionId = data.sessionId
        const cookie = header['Set-Cookie']
        resolve(cookie)
        wx.setStorageSync('app_cookie', cookie)
      } else {
        reject()
      }
    },
    fail () {
      reject()
    },
  })
}).catch(() => Promise.reject(new Error('登录失败！')))

// app.js
App({
  hasConfig:false,
  
  onLaunch(){
    // 展示本地存储能力
    let logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // console.dir(this)
    // // 获取用户信息
    wx.getSetting({
      success: res => {
        console.log('wx.getSttings.......')
        console.log(res)
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              console.log('wx.getUserInfo.......')
              console.log(res)
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })

    ///获取用户配置
    this.hasConfig=this.getConfig()
    console.log(this.hasConfig)

  },

  async getUserinfo () {
    try {
      return await request({
        url: '/api/user/userinfo',
      })
    } catch (error) {
      return {
        error,
      }
    }
  },

  async init () {
    try {
      let res = await this.getUserinfo()
      console.log(res)
      // if ()
      let isLogin = false
      if (res.error && res.error.status === 401) {
        isLogin = false
      } else {
        isLogin = res.data.data.isLogin
      }
      let cookie = wx.getStorageSync('app_cookie')
      const session = await checkSession()

      if (!session || !cookie || !isLogin) {
        console.log('登陆中.......')
        // 没有服务器登录态
        cookie = await login()
        res = await this.getUserinfo()
        isLogin = res.data.data.isLogin
      }
      // 获取用户头像等信息
      // const userInfo = await getUserInfo()
      // this.globalData.userInfo = userInfo

      // console.log()
      // const config = res.data.data.userInfo.config
      // if (config && Object.keys(config).length > 0) {
      //   setConfig(config)
      // }

      return Promise.resolve({
        isLogin,
        userInfo: res.data.data.userInfo,
      })
    } catch (error) {
      console.log(error)
      return error
    }
  },

  onShow () {
    // this.globalData.userInfoPromise = this.init()
    this.init().then((val)=>{
      this.globalData.userConfig=val.userInfo.config
    })
  },
  globalData: {
    userInfo: null,
    userConfig:null,
    friendId:null
  },

  setConfig:function(userConfig={}){
    this.globalData.userConfig=userConfig
    this.hasConfig=true
    setConfig(userConfig)
  },

  getConfig:function(){
    let userConfig=getConfig()
    if(userConfig.nameType==null){
      return false
    }
    this.globalData.userConfig=userConfig
    return true
    console.log(userConfig)
  },

  setUserInfo:function(userInfo={}){
    this.globalData.userInfo=userInfo
    
  }
})
