const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
   Question:[],
   QuestionContent:'',
   ShowCard:false
  },

  ShowModel:function(res){
    this.setData({
      QuestionContent:res.currentTarget.dataset.content,
      modalName: res.currentTarget.dataset.target
    })
  },

  HideModel:function(){
    this.setData({
      modalName: null
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.request({
      url: 'https://' + app.globalData.Api +'/api/query_common_quesrtion',
      method:'GET',
      header:{
        'content-type':'application/json'
      },
      success(res){
       that.setData({
         Question:res.data.rows
       })
      }
    })
    setTimeout(function(){
      that.setData({
        ShowCard:true
      },500)
    })
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
   * 用户点击右上角分
   */
  onShareAppMessage: function () {
  }

})