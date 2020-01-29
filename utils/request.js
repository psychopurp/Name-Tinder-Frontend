// const prefix = 'http://localhost:8793' // dev
// const prefix = 'http://148.70.182.55:8880' // phone
// const prefix = 'https://name-tinder.177name.com' // pro
const prefix = 'https://tansuo.smackgg.cn' // temp pro

export default requestOption => new Promise((resolve, reject) => {
  let { url,data,method } = requestOption
  console.log(data)
  const cookie = wx.getStorageSync('app_cookie')
  wx.request({
    ...requestOption,
    url: prefix + url,
    // data:(data!=null)?data:'',
    // method:method,
    header: {
      cookie,
      'content-type': 'application/json',
    },
    success (res) {
      if (res && res.statusCode === 200) {
        resolve(res)
        return
      }
      reject(res && res.data)
    },
    fail (error) {
      reject(error)
    },
  })
})
