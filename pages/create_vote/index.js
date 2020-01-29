import regeneratorRuntime from '../../utils/regenerator-runtime'
import request from '../../utils/request'


const app = getApp()
Page({
  data: {
    currentIndex: 0,
    voteList: [],
    nameList: [],
  },

  onLoad: function(options) {
    this.getName()
  },

  getName: async function() {
    const res = await request({
      url: `/api/likeName`,
    })
    console.log(app)
    let names = res.data.data.map((item) => new Name(item))
    names = names.filter((item) => (item.type == app.globalData.userConfig.nameType))
    
    this.setData({
      nameList: names,
    })
    console.log(res)

  },
  onSelect: function(e) {
    if (this.data.voteList.length < 7) {
      let item = e.currentTarget.dataset.index
      this.data.voteList.push(item)
      this.setData({
        voteList: this.data.voteList,
        nameList: this.data.nameList.filter((i) => (i.nameId != item.nameId))
      })
    }
    console.log(e.currentTarget)
  },
  onDelete: function(e) {
    // if (this.data.voteList.length < 7) {
    let item = e.currentTarget.dataset.index
    this.data.nameList.push(item)
    this.setData({
      nameList: this.data.nameList,
      voteList: this.data.voteList.filter((i) => (i.nameId != item.nameId))
    })
    // }
    console.log(e.currentTarget)
  },
  onSubmit: async function() {
    let voteList = this.data.voteList
    if (voteList.length < 2) {
      wx.showModal({
        title: '温馨提示',
        content: '投票的姓名个数必须是2个或以上',
      })
    } else {
      wx.showToast({
        title: '加载中',
        icon: 'loading',
        duration: 10000
      })


      const res = await request({
        url: `/api/vote/addVote`,
        method: 'POST',
        data: {
          names: this.data.voteList.map(item => (item.nameId))
        }
      })
      if (res.data.status) {
        wx.hideToast()
        let voteId = res.data.data.voteId;
        wx.redirectTo({
          url: `/pages/voting/index?voteId=${voteId}&state=1`,
        })

      }
      console.log(res)
    }
  },
  onDetail(){
    wx.showModal({
      title: '投票规则',
      content: "每次投票总人数上线：100人              投票次数：1次/人",
    })
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})


class Name {
  constructor(obj) {
    this.nameId = obj.nameId;
    this.name = obj.name;
    this.gender = obj.gender
    this.lastName = obj.lastName
    this.type = obj.type
  }
}