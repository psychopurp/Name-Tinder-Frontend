import regeneratorRuntime from '../../utils/regenerator-runtime'
import request from '../../utils/request'



Page({
  data: {
    currentIndex:0,
    nameList:[],
    boysList:[],
    girlsList:[]

  },


  changeToKz: function () {
    this.setData({
      currentIndex: 0
    })
  },
  changeToZh: function () {
    this.setData({
      currentIndex: 1
    })
  },

  onLoad: function (options) {
    this.getName()


  },

  getName:async function(){
    const res = await request({
      url: `/api/likeName`,
    })
    let names=res.data.data.map((item)=>new Name(item))
    console.log(names)
    this.setData({nameList:names,
    boysList:names.filter((item)=>item.gender===1),
     girlsList: names.filter((item) => item.gender === 2),})
    console.log(res)

  },

 
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})


class Name {
  constructor(obj) {
    this.nameId = obj.nameId;
    this.name = obj.name;
    this.gender = obj.gender
    this.lastName=obj.lastName
    this.type=obj.type
  }
}