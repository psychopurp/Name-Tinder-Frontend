import regeneratorRuntime from '../../utils/regenerator-runtime'
import request from '../../utils/request'

const app = getApp()

Page({
  data: {
    attender: [],
    friendAvatar:null,
    myAvatar:null,
    nameList:[],
    loaded:false,
    likes: null,
  },
   onLoad (e) {
     console.log(app.globalData)
     let userConfig=app.globalData.userConfig
    // let myAvatar=app.globalData.userInfo.avatarUrl
    console.dir(app.globalData)
    let friendId=e.userId
    let friendAvatar=e.avatar
    console.log(e)
    this.setData({
      // myAvatar:myAvatar,
      friendAvatar:friendAvatar
    })
    request({
      url: `/api/getCommonLikes`,
      method:'POST',
      data:{userId:friendId,nameType:userConfig.nameType}
    }).then((res)=>{
      console.log(res)
      let nameList = res.data.data.map((item) => new Name(item))
      console.log(nameList)
      this.setData({
        nameList:nameList,
        loaded:true
      })
    }).catch((e)=>console.log(e))
    // console.log(res.data.data)
    

    // this.setData({
      // attender: users.map(user => ({
      //   avatar: user.avatarUrl,
      //   name: user.nickName,
      // })),
      // likes: likes.map(like => ({
      //   ...like,
      //   displayName: +like.type === 0 ? like.en_name : like.name,
      //   genderClassName: like.gender === 0 ? 'boy' : 'girl',
      // })),
    // })
  },
})



class Name {
  constructor(obj) {
    this.nameId = obj.nameId;
    this.name = obj.name;
    this.explanation = obj.explanation?obj.explanation:""
    this.gender = obj.gender
    this.source = obj.source ? obj.source : ""
    this.willMatch = obj.willMatch ? obj.willMatch : ""
  }
}