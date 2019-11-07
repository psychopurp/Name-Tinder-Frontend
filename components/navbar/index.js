Component({
  data: {
    top: 100,
    height: 64,
  },
  created () {
    const { top, height } = wx.getMenuButtonBoundingClientRect()
    this.setData({
      top: top * 2,
      height: height * 2,
    })
  },
  methods: {
    goHome () {
      wx.redirectTo({
        url: '/pages/welcome/index',
      })
    },
  },
})
