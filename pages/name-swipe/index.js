/*
  之前逻辑都在 components 中，但是components的生命周期太少，导致很多onShow时间应该做的事情，并没有办法实现，
  小程序组件之间通信还比较麻烦，就移出来了
  原计划用户划到一定数量之后，会删除前面的dom，性能问题不大没时间就先不做了~
*/
// 小程序hack 想用async需要手动引入这个runtime
import regeneratorRuntime from '../../utils/regenerator-runtime'
import getTouchPosition from '../../utils/getTouchPosition'
import request from '../../utils/request'
import sleep from '../../utils/sleep'
import {
  getConfig
} from '../../utils/index'

const MOVE_DISTANCE = 500

const colors = ['#C3DFFF', '#FFBEDB']
const app = getApp()

const TITLES = {
  0: '哈萨克语名',
  1: '中文名',
}
Page({
  data: {
    cards: [],
    componentStyle: '',
    noCard: false,
    showShare: false,
    currentCard:null,
    nameType:0,
    detail:false
  },
  userConfig:null,
  nameCount:0,
  list: [],
  currentCardIndex: 0,
  changeX: 0,
  touchStartX: 0,
  touchLock: false,
  moveLastTime: 0,
  shared: false,
  update:false,


  onDetail:function(){
    // console.log('show detail..')
    this.setData({
      detail:true
    })
  },

  onSwipe:async function(e){
    let isLike=e.currentTarget.dataset.islike
    let direction=isLike==='true'?"right":'left'
    console.log('swipe...')
    if(this.data.detail){
      this.setData({
        detail:false
      })
     await sleep(300)
    }
    console.log('swiped')

    await this.updateCardStyle({
      immediate: true,
      direction: direction,
      nextIndex: true,
    })
    // this.setData(
    //   {
    //     detail: false
    //   }
    // )
  },
  pageRedirect:function(){
    let hasConfig=app.hasConfig
    if (!hasConfig) {
      wx.redirectTo({
        url: '../../pages/welcome/index',
      })
      return
    }
  },

  async onShow() {
    // this.times = +(wx.getStorageSync('user_like_times') || 0)
    if(this.userConfig==null)
    return
    wx.setNavigationBarTitle({
      title: TITLES[this.userConfig.nameType] || '',
    })
    // console.log(this.data.showShare, this.shared, this.times)
    // if (this.data.showShare === true && this.shared && this.times !== 5) {
    //   this.setData({
    //     showShare: false,
    //   })
    // }
    // if (JSON.stringify(this.config) !== JSON.stringify(config)) {
    //   this.config = config
    //   this.init()
    // }
  },

  async onLoad() {
    this.pageRedirect()
    let {
      userConfig,
      userInfo
    } = app.globalData
    this.userConfig=userConfig
    if(this.userConfig==null)
    return
 
    // userConfig = {
    //   nameType: 0,
    //   gender: 1,
    //   lastName: ''
    // }
    // console.log(app.globalData)
    // console.log(userConfig)

    let color = (userConfig.gender == 1) ? colors[0] : colors[1]
    this.setData({
      userConfig: userConfig,
      componentStyle: `background-color: ${color};}`,
      nameType:userConfig.nameType
    })
    // console.log(userInfo)
    // this.config = getConfig()
    this.init()
    // wx.setStorageSync('user_like_times', this.times)
    // const shared = +wx.getStorageSync('user_like_times') === 1
    // if (!shared) {
    //   wx.showTabBarRedDot({
    //     index: 1,
    //   })
    // }
  },

  async init() {
    console.log('init')
 
    this.currentCardIndex = 0
    this.nameCount=0
    this.changeX = 0
    this.touchStartX = 0
    this.list = []

    console.log(this.currentCardIndex)
    // await app.globalData.userInfoPromise
    if (this.update){
      this.currentCardIndex=-1
    }
    this.getNames()
  },

  async getNames() {
    console.log('获取名字')
    // this.config = getConfig()
    // const { type, gender, lastName } = this.config
    let userConfig = this.data.userConfig

    const res = await request({
      url: `/api/names?type=${userConfig.nameType}&gender=${userConfig.gender}&lastName=${userConfig.lastName}&isDoubleName=${userConfig.isDoubleName||false}`,
    })
    console.log(res)
    let cardList = res.data.data.map((item,index) => {
      let name = new Name(item)
      name.lastName = (userConfig.lastName == null) ? "" : userConfig.lastName
      let color=(name.gender==1)?colors[0]:colors[1]
      let idx=this.list.length+index
      name.style = this.getInitStyle(color, idx)
      // console.log(name.style)
      name.className=(index === 0) ? 'box-shadow' : ''
      return name
    })
    // console.log(cardList)

    
    this.list = this.list.concat(cardList)
    console.log(this.list)
    console.log(this.currentCardIndex)
    console.log('currenindex')

    this.updateCards()
  },

  updateCards() {
    const isClear=this.nameCount>50
    if(isClear){
      this.update=true
      this.init()
    }
    // console.log('slice........')
    this.setData({
      cards: this.list,
      currentCard:this.list[this.currentCardIndex]
    })
  },

  initCards(cards, force) {
    console.log('init cards')
    const preIndex = this.list.length
    return cards.map((card, i) => {
      const color = colors[card.gender - 1]
      const index = force ? i : preIndex + i
      return {
        // ...card,
        text: +this.config.type === 0 ? card.en_name : lastName + card.name,
        // userInfo: card.userInfo,
        type: card.type,
        color,
        style: this.getInitStyle(color, index),
        className: index === 0 ? 'box-shadow' : '',
        index,
        id: card._id,
      }
    })
  },

  onReview() {
    this.currentCardIndex = 0
    this.setData({
      noCard: false,
      cards: this.initCards(this.list, true),
    })
  },

  setDataP(data) {
    return new Promise(resolve => {
      this.setData(data, resolve)
    })
  },

  getInitStyle(color, index) {
    // const deg = parseInt(Math.random() * 5) - 2.5;
    let count=this.nameCount;
    this.nameCount++
    if (color) {
      return `background-color:${color}; transform: rotate(0deg) scale(1); opacity: 1; z-index: ${-count};}`
    }
    return 'display: none;'
  },

  async updateCardStyle(options = {}) {
    // const times = wx.getStorageSync('user_like_times') || 0
    // if (times === 5) {
    //   this.setData({
    //     showShare: true,
    //   })
    //   return
    // }
    let {
      immediate = false, direction, nextIndex = false
    } = options
    // const { cards } = this.data;
    console.log('index')
    console.log(this.currentCardIndex)
    let cards = this.list
    const index = this.currentCardIndex
    // console.log(this.list)

    const card=this.list[index]
    direction = direction || (this.touchChange.dx > 0 ? 'right' : 'left')
    // console.log(direction)

    if (!card) {
      return
    }

    // card 水平方向平移距离
    const x = immediate ?
      Number(`${direction === 'right' ? '' : '-'}${MOVE_DISTANCE}`) :
      this.touchChange.dx
    // console.log('水平移动')
    // console.log(x)

    // card 旋转角度
    const deg = (100 / MOVE_DISTANCE) * x
    const time = immediate ?
      ((MOVE_DISTANCE - this.changeX) / MOVE_DISTANCE) * 800 :
      0
    // console.log('旋转角度')
    // console.log(deg)
    const transition = `transition: ${immediate ? time : 0}ms all ease-in-out;`
    card.style = ` transform-origin: bottom 70%; transform: translate3d(${x}px, 0, 0) rotate(${deg}deg); opacity: 1; z-index: ${-index};${transition}`

    card.direction = direction
    console.log(card)
    console.log('style....')
    // console.log(card.style)
    // handle box shadow
    card.className = 'box-shadow'
    // if (cards[index + 1]) {
    //   cards[index + 1].className = 'box-shadow'
    // }

    // this.list = cards
    this.updateCards()

    if (!nextIndex) {
      return
    }

    // 处理所有卡片滑完的情况
    if (this.currentCardIndex === cards.length - 1) {
      setTimeout(() => {
        this.setData({
          noCard: true,
        })
      }, time)
      return
    }
    // this.currentCardIndex += 1
    this.updateCurrentCardIndex(direction)
  },

  async resetCardStyle() {
    const {
      cards
    } = this.data
    const index = this.currentCardIndex
    const card = cards[index]
    if (!card) {
      return
    }
    cards[index].style = `background-color: ${card.color}; transform-origin: bottom 70%;transform: translate3d(0px, 0, 0) rotate(deg); opacity: 1; z-index: ${-index};transition: 300ms all ease-in-out;`
    cards[index].direction = ''
     this.setData({
      cards:cards
    })
    // return cards
  },

  onTouchStart(e) {
    if (this.touchLock) {
      return
    }
    this.touchLock = true

    let touchPosition={
      x: e.changedTouches[0].clientX - e.currentTarget.offsetLeft,
      y: e.changedTouches[0].clientY - e.currentTarget.offsetTop
    }
    console.log(touchPosition)
    this.touchStart=touchPosition

    this.touchStartX = touchPosition.x
    this.touchStartY=touchPosition.y
    // this.updateCardStyle()
  },

  onTouchMove(e) {
    const touchPosition = getTouchPosition(e)
    this.touchChange={
      dx: touchPosition.x-this.touchStart.x,
      dy: touchPosition.y - this.touchStart.y,
    }
    console.log(this.touchChange)
    this.changeX = touchPosition.x - this.touchStartX
    this.changeY=touchPosition.y-this.touchStartY
    this.moveLastTime = e.timeStamp
    console.log('touchmove......')
    this.updateCardStyle()
  },
  async onTouchEnd(e) {
    const duration = e.timeStamp - this.moveLastTime
    console.log('duration...')
    console.log(duration)
    console.log('changeX')
    console.log(this.changeX)
    if(this.touchChange==null){
      const touchPosition = getTouchPosition(e)
      this.touchChange = {
        dx: touchPosition.x - this.touchStart.x,
        dy: touchPosition.y - this.touchStart.y,
      }
    }
    // this.moveLastTime = e.timeStamp

    // 少于一定时间或大于一定距离时，算做成功
    if (duration < 50 || this.touchChange.dx > 100) {
      await this.updateCardStyle({
        immediate: true,
        nextIndex: true,
      })
    } else {
      this.resetCardStyle()
    }
    this.touchLock = false
  },
  async swipeLeft() {
    await this.updateCardStyle({
      immediate: true,
      direction: 'left',
      nextIndex: true,
    })
 
  },
  async swipeRight() {
    await this.updateCardStyle({
      immediate: true,
      direction: 'right',
      nextIndex: true,
    })
    this.setData(
      {
        detail: false
      }
    )
  },

  updateCurrentCardIndex:async function(direction) {
      this.likeNameHandler(direction)
    
    if (this.currentCardIndex === this.list.length - 2) {
     await this.getNames()
    }
    // this.times += 1
    // if (this.times <= 6) {
    //   wx.setStorageSync('user_like_times', this.times)
    // }
    // console.log(this.list.splice(0, 1))
    console.log(this.list)
    // this.list.concat([])
    this.currentCardIndex ++
    this.updateCards()
   
  },

  likeNameHandler:async function(direction) {
    const card = this.list[this.currentCardIndex]
    console.log('handle.......')
    // console.log(card)

    let isLike=(direction==='right')?true:false
    // console.log(isLike)
    let lastName=this.userConfig.lastName||''
    // console.log(this.userConfig)
    // console.log(lastName)
    let res=await request({
      url: `/api/likeName`,
      method: 'POST',
      data:{nameId:card.nameId,isLike:isLike,lastName:lastName}
    })
    console.log(res.data)
  },
  onShareAppMessage() {
    // const config = getConfig()
    // this.shared = true
    // this.times === 6
    // wx.setStorageSync('user_like_times', 6)
    // this.setData({
    //   showShare: false
    // })
    return {
      title: '和我一起给宝宝取个好听的名字吧。',
      path: '/pages/welcome/index',
      imageUrl: '../../assets/image/share_image.png',
    }
  },

  onReturn:function(){
    this.setData({
      detail:false
    })
  }
})


class Name {
  constructor(obj) {
    this.nameId = obj.nameId;
    this.name = obj.name;
    this.explanation = obj.explanation
    this.gender = obj.gender
    this.source = obj.source
    this.willMatch = obj.willMatch
  }
}