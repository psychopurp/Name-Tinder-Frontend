import regeneratorRuntime from '../../utils/regenerator-runtime'
import request from '../../utils/request'



// 默认声明一个函数记录list显示的数据---删除状态
var initdata = function (that) {
  var list = that.data.userList
  for (var i = 0; i < list.length; i++) {
    list[i].shows = ""
  }
  that.setData({
    userList: list
  })}


Page({

  data: {
    delBtnWidth: 185, //删除按钮宽度单位（rpx）
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

  changeToFriend:function() {
    this.setData({
      currentIndex: 1
    })
  },
  changeToVote:function() {
    this.setData({
      currentIndex: 2
    })
  },


  // 开始滑动事件
  touchS: function (e) {
    if (e.touches.length == 1) {
      this.setData({
        //设置触摸起始点水平方向位置 
        startX: e.touches[0].clientX
      });
    }
  },
  touchM: function (e) {
    var that = this;
    // initdata(that)
    if (e.touches.length == 1) {
      //手指移动时水平方向位置 
      var moveX = e.touches[0].clientX;
      //手指起始点位置与移动期间的差值 
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      // var txtStyle = "";
      if (disX == 0 || disX < 0) { //如果移动距离小于等于0，文本层位置不变 
        // txtStyle = "left:0px";
      } else if (disX > 0) { //移动距离大于0，文本层left值等于手指移动距离 
        // txtStyle = "left:-" + disX + "px";
        if (disX >= delBtnWidth) {
          //控制手指移动距离最大值为删除按钮的宽度 
          // txtStyle = "left:-" + delBtnWidth + "px";
        }
      }

    }
  },
  // 滑动中事件
  touchE: function (e) {
    if (e.changedTouches.length == 1) {
      //手指移动结束后水平位置 
      var endX = e.changedTouches[0].clientX;
      //触摸开始与结束，手指移动的距离 
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮 
      var txtStyle = "";
      txtStyle = disX > delBtnWidth / 2 ? "left:-" + delBtnWidth + "rpx" : "left:0px";
      //获取手指触摸的是哪一项 
      var index = e.currentTarget.dataset.index;
      var list = this.data.userList;
      list[index].shows = txtStyle;
      console.log("1", list[index].shows);
      //更新列表的状态 
      this.setData({
        userList: list
      });
    } else {
      console.log("2");
    }
  },
  //点击删除按钮事件 
  delItem: function (e) {

    // 打印出当前选中的index
    console.log(e.currentTarget.dataset.index);
    // 获取到列表数据
    var list = this.data.userList;
    // 删除
    list.splice(e.currentTarget.dataset.index, 1);
    console.log(list)
    // 重新渲染
    this.setData({
      userList: list
    })
    initdata(this)
  }
 
})


class User {
  constructor(obj) {
    this.userId = obj.userId;
    this.name = obj.name;
    this.gender = obj.gender
    this.avatar = obj.avatar
  }
}