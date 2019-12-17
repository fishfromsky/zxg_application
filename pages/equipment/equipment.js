const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Location:[],
    LocationNumber:[],
    Username:'',
    LocationName:'',
    IsNone:false,
    ShowCard:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.request({
      url: 'https://'+app.globalData.Api+'/api/query_all_equipment_by_installation',
      method:'GET',
      header:{
        "content-type":'application/json'
      },
      data:{
        InstallationLocation: app.globalData.SearchName
      },
      success(res){
        console.log(res)
        that.setData({
          Location:res.data.row,
          Username:app.globalData.NickName,
          LocationName:app.globalData.SearchName
        })
        if (that.data.Location.length === 0) {
          that.setData({
            IsNone: true
          })
        }
        else{
          var LocationList = that.data.Location
          var count = 0, num = 0 
          var name = LocationList[0].address_detail
          var i = 0
          while (i < LocationList.length){
            if (LocationList[i].address_detail === name){
              count++
            }
            else {
              var name1 = 'LocationNumber[' + num + '].address'
              var name2 = 'LocationNumber[' + num + '].number'
              that.setData({
                [name1]:LocationList[i - 1].address_detail,
                [name2]:count
              })
              name = LocationList[i].address_detail
              count = 1
              num++
            }
            i++
            if (i === LocationList.length){
              var name1 = 'LocationNumber[' + num + '].address'
              var name2 = 'LocationNumber[' + num + '].number'
              that.setData({
                [name1]: LocationList[i - 1].address_detail,
                [name2]: count
              })
            }
          } 
        }
      }
    })
    setTimeout(function(){
      that.setData({
        ShowCard:true
      },1000)
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})