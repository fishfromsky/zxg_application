//app.js
App({

  onLaunch: function () {
    var that = this
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.height = res.statusBarHeight
      }
    })
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        wx.request({
          url: 'https://'+that.globalData.Api+'/api/openid',
          data:{
            code:res.code
          },
          method:'GET',
          header:{
            'content-type': 'application/json;charset=utf-8',
          },
          success:function(res){
            that.globalData.Openid = res.data.openid
            console.log("返回的openid为" + that.globalData.Openid)
            if (wx.getStorageSync('openid') === ''){
              wx.setStorageSync('openid', that.globalData.Openid)
            }
            else if (wx.getStorageInfoSync('picture') === ''||wx.getStorageSync('nickname') === ''){}
            else{
              that.globalData.hasuserInfo = true
              that.globalData.PictureSrc = wx.getStorageSync('picture')
              that.globalData.NickName = wx.getStorageSync('nickname')
            }
          },
          fail:function(res){
            console.log(res)
          }
        })
      },
      fail(){
        console.log("获取登录状态失败")
      }
    })
    wx.getSystemInfo({
      success: function(res) {
        that.globalData.DeviceCate = res.platform
      },
    })
  },
  globalData: {
    hasuserInfo:false,
    DeviceId:'',
    ScanCode:false,
    Consume:0,
    DeviceCate:'',
    TempId:'',
    Openid:'',
    NickName:'',
    PictureSrc:'',
    TicketId:[],
    SearchName:'',
    FailConnectTime:0,   //连接失败重连的次数
    FailAdaptTime:0,   //匹配失败次数
    Api:'zhixiaogai.com',
    AdverContent:''         //广告信息
  }
})