const app = getApp();
Page({
  data: {
    ShowModel:false,
    Info:'',
    ShowCard1:false,
    ShowCard2:false,
    ShowCard3:false
  },

  SendComplain:function(info){
    var that = this
    wx.request({
      url: 'https://' + app.globalData.Api + '/api/submit_complaints',
      header: {
        "content-type": 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      data: {
        openid: app.globalData.Openid,
        complaints_content: that.data.Info
      },
      success(res) {
        wx.showToast({
          title: '投诉提交成功',
        })
      }
    })
  },

  Shebei:function(){
    wx.showToast({
      title: '投诉提交成功',
    })
    this.setData({
      Info:'设备故障'
    })
    this.SendComplain(this.data.Info)
  },

  Zhifu:function(){
    wx.showToast({
      title: '投诉提交成功',
    })
    this.setData({
      Info:'支付故障'
    })
    this.SendComplain(this.data.Info)
  },

  Exception:function(){
    var that = this;
    that.setData({
      ShowModel:true
    })
  },

  SetValue:function(e){
    var that = this;
    that.setData({
      Info:e.detail.value
    })
    console.log("输入信息"+that.data.Info);
  },

  Confrim:function(){
    var that = this;
    that.setData({
      ShowModel:false
    })
    if (that.data.Info ==''){
      wx.showToast({
        title: '输入不能为空！',
        icon:'none'
      })
    }
    else{
      this.SendComplain(this.data.Info)
    }
  },

  Cancel:function(){
    var that = this;
    that.setData({
      ShowModel:false
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    that.setData({
      src:app.globalData.PictureSrc,
      nickname:app.globalData.NickName
    })
    setTimeout(function(){
      that.setData({
        ShowCard1:true
      })
    },500)
    setTimeout(function(){
      that.setData({
        ShowCard2:true
      })
    },1000)
    setTimeout(function(){
      that.setData({
        ShowCard3:true
      })
    },1500)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})