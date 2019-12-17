const app = getApp()
Page({
  data: {
    Xiaofei: [],
    src: '',
    nickname: '',
    NotXiaofei:false,
    PayStatus: false
  },
  
  payTap: function(e) {
    var that = this
    that.setData({
      PayStatus:true
    })
    console.log('开始支付')
    var consumption_amount = e.currentTarget.dataset.consumption_amount * 10 * 10;
    wx.request({
      url: 'https://'+app.globalData.Api+'/api/pay?openid=' + app.globalData.Openid + '&total_fee=' + consumption_amount,
      success(data) {
        console.log(data.data.package)
        wx.requestPayment({
          timeStamp: data.data.timeStamp,
          nonceStr: data.data.nonceStr,
          package: data.data.package,
          signType: 'MD5',
          paySign: data.data.paySign,
          success(res) {
            console.log("成功支付")
            wx.request({
              url: 'https://'+app.globalData.Api+'/api/modify_pay_state',
              data: {
                openid: app.globalData.Openid
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              method: 'POST',
              success(res) {
                console.log("成功更改支付状态")
                that.onLoad()
              }
            })
          },
          fail(res) {
            console.log("支付失败")
          }
        })
      }
    })

  },

  Return: function() {
    wx.redirectTo({
      url: '../index/index',
    })
  },

  //事件处理函数

  onLoad: function() {
    var that = this;
    that.setData({
      src: app.globalData.PictureSrc,
      nickname: app.globalData.NickName
    })
    wx.request({
      url: 'https://'+app.globalData.Api+'/api/query_records_of_consumption?openid=' + app.globalData.Openid, //请求地址
      header: { //请求头
        "Content-Type": "application/json"
      },
      method: "GET",
      success: function(res) {
        that.setData({
          Xiaofei: res.data.rows
        })
        if (that.data.Xiaofei.length === 0){
          that.setData({
            NotXiaofei:true
          })
        }
      },
      fail: function(err) {
        that.setData({
          NotXiaofei: true
        })
      }, //请求失败
      complete: function() {} //请求完成后执行的函数
    })
  },


  onHide: function() {
    var that = this;
    that.setData({
      XiaofeiCheck: false
    })
  },

  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})