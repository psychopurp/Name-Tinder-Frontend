import regeneratorRuntime from '../../utils/regenerator-runtime'
import request from '../../utils/request'


const app = getApp()
Page({
  data: {
    userInfo: '',
    members: [],
    names: [],
    share:false,
    timeString:'',
    selected:-1,
    isVoted:false,
    state:'1' //保存四种状态 1：第一次创建，可以分享 2：其他用户可以看到，有投票按钮 3:显示投票后的结果
              //4：自己点开查看结果的页面
  },

  onLoad: function (options) {
    console.log(options)
      this.setData({
        state:options.state
      })
    console.log(this.data)
    // options.voteId ='5e313883dbfc250084178c9e'
    this.voteId=options.voteId
    this.getVote(options.voteId)
  },

  getVote: async function (voteId) {
    // voteId="5e2817512757475e7a4402cf"
    this.voteId=voteId
    const res = await request({
      url: `/api/vote?voteId=${voteId}`,
    })
    console.log(res)
    if(res.data.status){
      let item=res.data.data
      let date = new Date(item.createdAt)
      this.endTime=date
      date.setDate(date.getDate() + 1)
      let end = date.toLocaleDateString() + date.toLocaleTimeString()
      this.initAvatar(res.data.data.names,res.data.data.userId)

      let state=this.data.state
      if(this.data.state=='2'){
        state = res.data.data.voted ? '3' : '2'
        if(res.data.data.itSelf){state='4'}
      }
    this.setData({
      names:res.data.data.names,
      userInfo:res.data.data.userInfo,
      timeString:end,
      isVoted:res.data.data.voted,
      state:state,
    })
    console.log(this.data)
    }

  },

  initAvatar(names,userId){
    names.forEach((item)=>{
      if(item.members.length>9){
        item.members=item.members.slice(0,9)
      }
    })
  },

  onSelect: function (e) {
    if(this.data.state!='2'){
      return
    }
      let index = e.currentTarget.dataset.index
      if(index==this.data.selected){
        index=-1
      }
      this.setData({
        selected:index
      })

  },

  async onVote(){
    console.log(this.data)
    if (this.data.selected != -1) {
      wx.showToast({
        title: '',
        icon: 'loading',
        duration: 10000
      })
      if(new Date()>this.endTime){
        wx.showModal({
          title: '投票规则',
          content: "该投票截止时间已到，停止提交。",
        })
        return 
      }
      const res = await request({
        url: `/api/vote`,
        method: 'POST',
        data: {
          voteId: this.voteId,
          nameId: this.data.names[this.data.selected]._id
        }
      })
      wx.hideToast()
      console.log(res)
      if(!res.data.status){
        wx.showModal({
          title: '投票规则',
          content: res.data.data,
        })
      }
      this.setData({
        state:'3'
      })
      this.getVote(this.voteId)
      
    }else{
      wx.showModal({
        title: '投票规则',
        content: "请选择一个名字",
      })
    }
    console.log(this.data.names)
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '和我一起给宝宝取个好听的名字吧。',
      path: `/pages/voting/index?voteId=${this.voteId}&state=2`,
      imageUrl: '../../assets/image/share_image.png',
    }
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