/*
  之前逻辑都在 components 中，但是components的生命周期太少，导致很多onShow时间应该做的事情，并没有办法实现，
  小程序组件之间通信还比较麻烦，就移出来了
  原计划用户划到一定数量之后，会删除前面的dom，性能问题不大没时间就先不做了~
*/
// 小程序hack 想用async需要手动引入这个runtime
import regeneratorRuntime from '../../utils/regenerator-runtime'
import getTouchPosition from '../../utils/getTouchPosition'
import request from '../../utils/request'
import { getConfig } from '../../utils/index'

const MOVE_DISTANCE = 500

const colors = ['#C3DFFF', '#FFBEDB']
const app = getApp()

const TITLES = {
  0: '哈萨克语名',
  1: '中文名',
}
Page({
  data: {
    cards: [
    ],
    componentStyle: '',
    noCard: false,
    showShare: false,
  },
  list: [],
  currentCardIndex: 0,
  changeX: 0,
  touchStartX: 0,
  touchLock: false,
  moveLastTime: 0,
  shared: false,
  async onShow () {
    // this.times = +(wx.getStorageSync('user_like_times') || 0)
    const config = getConfig()
    const { type } = config
    wx.setNavigationBarTitle({
      title: TITLES[type] || '',
    })
    // console.log(this.data.showShare, this.shared, this.times)
    // if (this.data.showShare === true && this.shared && this.times !== 5) {
    //   this.setData({
    //     showShare: false,
    //   })
    // }
    if (JSON.stringify(this.config) !== JSON.stringify(config)) {
      this.config = config
      this.init()
    }
  },
  async onLoad () {
    this.config = getConfig()
    this.init()
    // wx.setStorageSync('user_like_times', this.times)
    const shared = +wx.getStorageSync('user_like_times') === 1
    if (!shared) {
      wx.showTabBarRedDot({
        index: 1,
      })
    }
  },

  async init () {
    console.log('init')
    this.currentCardIndex = 0
    this.changeX = 0
    this.touchStartX = 0
    this.list = []
    await app.globalData.userInfoPromise
    this.getNames()
  },

  async getNames () {
    this.config = getConfig()
    const { type, gender, lastName } = this.config
    const res = await request({
      url: `/api/names?type=${type}&gender=${gender}&lastName=${lastName}`,
    })
    console.log(res);

    const cards = this.initCards(res.data.data)
    // await this.setDataP({
    //   cards: this.data.cards.slice().concat(cards),
    // })
    this.list = this.list.concat(cards)
    await this.updateCards()
    // console.log(this.list, this.data.cards)
  },
  updateCards () {
    // const start = this.currentCardIndex > 20 ? this.currentCardIndex - 20 : 0
    // const end = this.currentCardIndex + 20 > this.list.length ? this.list.length : this.currentCardIndex + 20
    this.setData({
      // cards: this.list.slice(start, end)
      cards: this.list,
    })
  },
  initCards (cards, force) {
    const preIndex = this.list.length
    const { lastName } = this.config
    return cards.map((card, i) => {
      const color = colors[card.gender]
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

  onReview () {
    this.currentCardIndex = 0
    this.setData({
      noCard: false,
      cards: this.initCards(this.list, true),
    })
  },

  setDataP (data) {
    return new Promise(resolve => {
      this.setData(data, resolve)
    })
  },

  getInitStyle (color, index) {
    // const deg = parseInt(Math.random() * 5) - 2.5;
    if (color) {
      return `background-color: ${color}; transform: rotate(0deg) scale(1); opacity: 1; z-index: ${-index};}`
    }
    return 'display: none;'
  },

  async updateCardStyle (options = {}) {
    const times = wx.getStorageSync('user_like_times') || 0
    if (times === 5) {
      this.setData({
        showShare: true,
      })
      return
    }
    let { immediate = false, direction, nextIndex = false } = options
    // const { cards } = this.data;
    let cards = this.list
    const index = this.currentCardIndex
    this.currentCardIndex
    const card = cards[index]
    direction = direction || (this.changeX > 0 ? 'right' : 'left')

    if (!card) {
      return
    }

    // card 水平方向平移距离
    const x = immediate
      ? Number(`${direction === 'right' ? '' : '-'}${MOVE_DISTANCE}`)
      : this.changeX


    // card 旋转角度
    const deg = (100 / MOVE_DISTANCE) * x
    const time = immediate
      ? ((MOVE_DISTANCE - this.changeX) / MOVE_DISTANCE) * 800
      : 0
    const transition = `transition: ${immediate ? time : 0}ms all ease-in-out;`
    cards[index].style = `background-color: ${card.color}; transform-origin: bottom 70%; transform: translate3d(${x}px, 0, 0) rotate(${deg}deg); opacity: 1; z-index: ${-index};${transition}`
    cards[index].direction = direction

    // handle box shadow
    cards[index].className = 'box-shadow'
    if (cards[index + 1]) {
      cards[index + 1].className = 'box-shadow'
    }

    this.list = cards
    await this.updateCards()

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
  async resetCardStyle () {
    const { cards } = this.data
    const index = this.currentCardIndex
    const card = cards[index]
    if (!card) {
      return
    }
    cards[index].style = `background-color: ${card.color}; transform-origin: bottom 70%;transform: translate3d(0px, 0, 0) rotate(deg); opacity: 1; z-index: ${-index};transition: 300ms all ease-in-out;`
    cards[index].direction = ''
    await this.setDataP({
      cards,
    })
    // return cards
  },

  onTouchStart (e) {
    if (this.touchLock) {
      return
    }
    this.touchLock = true

    const touchPosition = getTouchPosition(e)
    this.touchStartX = touchPosition.x
  },
  onTouchMove (e) {
    const touchPosition = getTouchPosition(e)
    this.changeX = touchPosition.x - this.touchStartX
    this.moveLastTime = e.timeStamp

    this.updateCardStyle()
  },
  async onTouchEnd (e) {
    const duration = e.timeStamp - this.moveLastTime
    this.moveLastTime = e.timeStamp

    // 少于一定时间或大于一定距离时，算做成功
    if (duration < 50 || this.changeX > 100) {
      await this.updateCardStyle({
        immediate: true,
        nextIndex: true,
      })
    } else {
      this.resetCardStyle()
    }
    this.touchLock = false
  },
  async swipeLeft () {
    await this.updateCardStyle({
      immediate: true,
      direction: 'left',
      nextIndex: true,
    })
  },
  async swipeRight () {
    await this.updateCardStyle({
      immediate: true,
      direction: 'right',
      nextIndex: true,
    })
  },
  updateCurrentCardIndex (direction) {
    if (direction === 'right') {
      this.likeNameHandler()
    }
    if (this.currentCardIndex === this.list.length - 10) {
      this.getNames()
    }
    // this.times += 1
    // if (this.times <= 6) {
    //   wx.setStorageSync('user_like_times', this.times)
    // }
    this.currentCardIndex += 1
  },
  likeNameHandler () {
    const card = this.list[this.currentCardIndex]
    // console.log(card)
    const { type, gender } = this.config

    const nameQuery = +type === 1 ? `&name=${encodeURIComponent(card.text)}` : ''
    request({
      url: `/api/name/like?id=${card.id}&type=${card.type}&gender=${gender}${nameQuery}`,
      method: 'PUT',
    })
  },
  onShareAppMessage () {
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
})
