import regeneratorRuntime from '../../utils/regenerator-runtime'
import request from '../../utils/request'



// 默认声明一个函数记录list显示的数据---删除状态
var initdata = function(that, isVote) {
  var list = isVote ? that.data.voteList : that.data.userList
  for (var i = 0; i < list.length; i++) {
    list[i].shows = ""
  }
  if (isVote) {
    that.setData({
      voteList: list
    })
  } else {
    that.setData({
      userList: list,
    })
  }

}

const app = getApp()
Page({

  data: {
    delBtnWidth: 185, //删除按钮宽度单位（rpx）
    userList: [],
    hasFriend: false,
    currentIndex: 1,
    voteList: []
  },
  onShow() {
    this.getVotes()
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

    this.backendUser = (await request({
      url: '/api/user'
    })).data.data
    // console.log(this.backendUser)
  },
  async getVotes() {
    const res = await request({
      url: `/api/vote`,
    })
    console.log(res)

    if (res.data.status) {

      res.data.data.forEach((item) => {
        let names = []
        console.log(item)
        item.names.forEach((j) => {
          names.push(j.lastName + j.name)
        })
        item.nameString = names.join()

        let date = new Date(item.createdAt)
        date.setDate(date.getDate() + 1)
        let diff = date.getTime() - (new Date()).getTime()
        console.log(diff)
        let end = date.toLocaleDateString() + date.toLocaleTimeString()
        // console.log(date.toLocaleDateString()+date.toLocaleTimeString())
        item.endTime = end

      })

      this.setData({
        voteList: res.data.data
      })
    }
  },
  onVote(e) {
    console.log(e)
    let voteId = e.currentTarget.dataset.item.voteId
    wx.navigateTo({
      url: `/pages/voting/index?voteId=${voteId}&state=4`,
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
      path: `/pages/share/index?userId=${this.backendUser._id}`,
      imageUrl: '../../assets/image/share_image.png',
    }


  },
  onTapUser: function(e) {
    let item = e.target.dataset.item
    console.log(item)
    wx.navigateTo({
      url: `/pages/likelist/index?userId=${item.userId._id}&avatar=${item.avatar}`,
    })
  },

  changeToFriend: function() {
    this.setData({
      currentIndex: 1
    })
  },
  changeToVote: function() {
    this.setData({
      currentIndex: 2
    })
  },


  // 开始滑动事件
  touchS: function(e) {
    if (e.touches.length == 1) {
      let listIdx = e.currentTarget.dataset.isVote == "true" ? 1 : 0
      this.listType = {
        0: this.data.userList,
        1: this.data.voteList
      }
      // let change=this.listType[listIdx]
      // this.setData({
      //   //设置触摸起始点水平方向位置 
      //   startX: e.touches[0].clientX,
      // });
      this.data['startX'] = e.touches[0].clientX
      console.log(this)
    }
  },
  touchM: function(e) {
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
  touchE: function(e) {

    if (e.changedTouches.length == 1) {
      let listIdx = e.currentTarget.dataset.isvote == "true" ? 1 : 0

      //手指移动结束后水平位置 
      var endX = e.changedTouches[0].clientX;
      //触摸开始与结束，手指移动的距离 
      var disX = this.data['startX'] - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮 
      var txtStyle = "";
      txtStyle = disX > delBtnWidth / 2 ? "left:-" + delBtnWidth + "rpx" : "left:0px";
      //获取手指触摸的是哪一项 

      var index = e.currentTarget.dataset.index;
      // var list = this.data.userList;
      let list = this.listType[listIdx]
      console.log('正在操作 ' + listIdx)
      list[index].shows = txtStyle;

      console.log("1", list[index].shows);
      //更新列表的状态 
      if (listIdx == 0) {
        this.setData({
          userList: list
        });
      } else {
        this.setData({
          voteList: list
        });
      }

    } else {
      console.log("2");
    }
  },
  //点击删除按钮事件 
  delItem: function(e) {
    let listIdx = e.currentTarget.dataset.isvote == "true" ? 1 : 0
    wx.showModal({
      title: '提示',
      content: listIdx == 0 ? "确认删除亲友么？" : "确认删除投票么？",
      success:async (res) => {
        if (res.confirm) {
          console.log(e.currentTarget.dataset)
          // // 获取到列表数据
          var list = this.listType[listIdx]
          let item = list[e.currentTarget.dataset.index]
          console.log(item)
          // // 删除
          wx.showToast({
            title: '',
            icon: 'loading',
            duration: 10000
          })
          const res = await request({
            url: listIdx == 0 ? `/api/delFriend` :'/api/vote/delVote',
            method: 'POST',
            data: listIdx == 0 ? {
              userId: item.userId
            } : {
              voteId: item.voteId
            }
          })
          if(res.data.status){
            list.splice(e.currentTarget.dataset.index, 1);
          }
          wx.hideToast()
          console.log(res)
          // // 重新渲染
          if (listIdx == 0) {
            this.setData({
              userList: list
            });
          } else {
            this.setData({
              voteList: list
            });
          }
        } else if (res.cancel) {
          initdata(this, listIdx == 1)
        }
      }
    })

  },

  toVotePage: function() {
    wx.navigateTo({
      url: '/pages/create_vote/index'
    })
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