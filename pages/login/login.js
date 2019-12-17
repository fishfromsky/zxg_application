const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    src: '',
    NickName: '',
    IsLogin: false,
    ShowLogin:false,
    ShowFunction:false,
    Function:[
      {
        name:'查看消费',
        path:'Xiaofei',
        icon:'xiaofei.png'
      },
      {
        name:'开具发票',
        path:'Fapiao',
        icon:'fapiao.png'
      },
      {
        name:'我要投诉',
        path:'Tousu',
        icon:'tousu.png'
      },
      {
        name:'我要报修',
        path:'Baoxiu',
        icon:'amend.png'
      },
      {
        name:'常见问题',
        path:'Question',
        icon:'wendang.png'
      },
      {
        name:'加盟合作',
        path:'Jiameng',
        icon:'hezuowoshou.png'
      }
    ]
  },

  GetMyInfo: function(res) {
    var info = res.detail.userInfo
    this.setData({
      src: info.avatarUrl,
      NickName: info.nickName,
      IsLogin: true
    })
    app.globalData.NickName = this.data.NickName
    app.globalData.PictureSrc = this.data.src
    app.globalData.hasuserInfo = true
    wx.setStorageSync('picture', this.data.src)
    wx.setStorageSync('nickname', this.data.NickName)
    wx.request({
      url: 'https://'+app.globalData.Api+'/api/add_wechat_user',
      method:'POST',
      header:{
        "content-type": 'application/x-www-form-urlencoded'
      },
      data:{
        openid:app.globalData.Openid,
        head_portrait: app.globalData.PictureSrc,
        name: app.globalData.NickName
      },
      success(res){
        console.log('提交用户信息成功'+JSON.stringify(res))
      }
    })
  },

  Xiaofei: function() {
    if (!this.data.IsLogin) {
      wx.showModal({
        title: '提示',
        content: '您尚未登录',
      })
    } else {
      wx.navigateTo({
        url: '../consume/consume',
      })
    }
  },

  Fapiao: function() {
    if (!this.data.IsLogin) {
      wx.showModal({
        title: '提示',
        content: '您尚未登录',
      })
    } else {
      wx.navigateTo({
        url: '../ticket/ticket',
      })
    }
  },

  Tousu: function() {
    if (!this.data.IsLogin) {
      wx.showModal({
        title: '提示',
        content: '您尚未登录',
      })
    } else {
      wx.navigateTo({
        url: '../complain/complain',
      })
    }
  },

  Baoxiu: function() {
    if (!this.data.IsLogin) {
      wx.showModal({
        title: '提示',
        content: '您尚未登录',
      })
    } else {
      wx.navigateTo({
        url: '../repair/repair',
      })
    }
  },

  Question: function() {
    if (!this.data.IsLogin) {
      wx.showModal({
        title: '提示',
        content: '您尚未登录',
      })
    } else {
      wx.navigateTo({
        url: '../question/question',
      })
    }
  },

  Jiameng: function() {
    if (!this.data.IsLogin) {
      wx.showModal({
        title: '提示',
        content: '您尚未登录',
      })
    } else {
     wx.navigateTo({
       url: '../join/join',
     })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    if (app.globalData.hasuserInfo) {
      this.setData({
        src: app.globalData.PictureSrc,
        NickName: app.globalData.NickName,
        IsLogin: app.globalData.hasuserInfo
      })
    }
    setTimeout(function(){
      that.setData({
        ShowLogin:true
      })
    },500)
    setTimeout(function(){
      that.setData({
        ShowFunction:true
      })
    },1000)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})