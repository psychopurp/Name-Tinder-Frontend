import regeneratorRuntime from '../../utils/regenerator-runtime'
import request from '../../utils/request'

Page({

  data: {
    userList: [],
    hasFriend: false,
    currentIndex: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function(options) {
    const res = await request({
      url: `/api/getFriends`,
    })
    console.log('获取好友....')
    console.log(res.data)

    this.data.userList.push(...res.data.data.map((item) => new User(item)))
    // console.log(this.data.userList)
    // console.log((this.data.userList[0].userId))
    this.setData({
      userList: this.data.userList,
      hasFriend: (this.data.userList.length != 0)
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    // const config = getConfig()
    wx.setStorageSync('user_like_times', 1)
    return {
      title: '和我一起给宝宝取个好听的名字吧。',
      path: `/pages/share/index?groupId=${this.selfGroupId}&config=${encodeURIComponent(JSON.stringify(config))}`,
      imageUrl: '../../assets/image/share_image.png',
    }

  },
  onTapUser:function(e){
    let item = e.target.dataset.item
    console.log(item.userId)
    wx.navigateTo({
      url: `/pages/likelist/index?userId=${item.userId}&avatar=${item.avatar}`,
    })
  },

  changeToFriend() {
    this.setData({
      currentIndex: 1
    })
  },
  changeToVote() {
    this.setData({
      currentIndex: 2
    })
  },
 
})


class User {
  constructor(obj) {
    this.userId = obj.userId;
    this.name = obj.name;
    this.gender = obj.gender
    this.avatar = obj.avatar
  }
}