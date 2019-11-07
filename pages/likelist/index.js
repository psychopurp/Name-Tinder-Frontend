import regeneratorRuntime from '../../utils/regenerator-runtime'
import request from '../../utils/request'

Page({
  data: {
    attender: [],
    likes: null,
  },
  async onLoad (e) {
    // console.log(e.groupId)
    const res = await request({
      url: `/api/group/${e.groupId}`,
    })

    const { users, likes } = res.data.data
    // console.log(likes)
    this.setData({
      attender: users.map(user => ({
        avatar: user.avatarUrl,
        name: user.nickName,
      })),
      likes: likes.map(like => ({
        ...like,
        displayName: +like.type === 0 ? like.en_name : like.name,
        genderClassName: like.gender === 0 ? 'boy' : 'girl',
      })),
    })
  },
})
