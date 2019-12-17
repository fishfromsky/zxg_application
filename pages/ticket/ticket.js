const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Record:[],
    Current:[],
    Comsumption_id:[],
    AllSelectStatus:false,
    Count:0,
    ShowNotList:false
  },

  Fapiao({ detail = {} }){
    const index = this.data.Current.indexOf(detail.value);
    if (index === -1 ){
      this.data.Current.push(detail.value)
      var index1 = parseInt(detail.value)-1
      var count = this.data.Record[index1].consumption_amount
      this.data.Comsumption_id.push(this.data.Record[index1].consumption_id)
      this.setData({
        Count:parseFloat((this.data.Count+parseFloat(count)).toFixed(2))
      })
    }
    else{
      this.data.Current.splice(index, 1)
      var index1 = parseInt(detail.value)-1
      var name = 'Record['+index1+'].checked'
      var count = this.data.Record[index1].consumption_amount
      var index2 = this.data.Comsumption_id.indexOf(this.data.Record[index1].consumption_id)
      this.data.Comsumption_id.splice(index2, 1)
      this.setData({
        [name]:false,
        Count:parseFloat((this.data.Count-parseFloat(count)).toFixed(2))
      })
    }
    this.setData({
      Current: this.data.Current
    });
    console.log(this.data.Comsumption_id)
    app.globalData.Consume = this.data.Count
    app.globalData.TicketId = this.data.Comsumption_id
  },

  AllSelect:function({detail = {}}){
    var that = this;
    if (!that.data.AllSelectStatus){
      that.setData({
        AllSelectStatus:detail.current
      })
    }
    else{
      that.setData({
        AllSelectStatus:false
      })
    }
    var carts = that.data.Record;
    var length = carts.length;
    var num = 0.00;
    var currents=[];
    var consump = []
    if (that.data.AllSelectStatus){
      for (var i = 0; i < length; i++){
        carts[i].checked=that.data.AllSelectStatus;
        num = parseFloat((num + parseFloat(carts[i].consumption_amount)).toFixed(2))
        currents.push((carts[i].id).toString());
        consump.push(carts[i].consumption_id)
      }
      that.setData({
        Record:carts,
        Count:num,
        Current:currents,
        Comsumption_id: consump
      })
      console.log(that.data.Comsumption_id);
      app.globalData.Consume = this.data.Count
      app.globalData.TicketId = this.data.Comsumption_id
    }
    else{
      for (var i = 0; i < length; i++){
        carts[i].checked = that.data.AllSelectStatus;
      }
      that.setData({
        Count:0,
        Record:carts,
        Current:[],
        Comsumption_id: []
      })
      app.globalData.TicketId = []
      app.globalData.Consume = 0
    }
  },

  Confrim:function(){
    if (this.data.Count===0){
      wx.showToast({
        title: '提交金额不可以为0',
        icon:'none'
      })
    }
    else{
      wx.navigateTo({
        url: '../application/application',
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.request({
      url: 'https://'+app.globalData.Api+'/api/query_records_of_consumption',
      header:{
        "Content-Type": "application/json"
      },
      data:{
        openid:app.globalData.Openid
      },
      method:'GET',
      success(res){
        console.log(res)
        var record = res.data.rows
        var recordlist = []
        for (var i = 0; i < record.length; i++){
          if (record[i].invoice_status === '0' & record[i].pay_or_not === '1'){
            recordlist.push(record[i])
          }
        }
        that.setData({
          Record:recordlist
        })
        if (recordlist.length === 0){
          that.setData({
            ShowNotList:true
          })
        }
        else{
          for (var i = 0; i < recordlist.length; i++) {
            var name1 = 'Record[' + i + '].checked'
            var name2 = 'Record[' + i + '].id'
            that.setData({
              [name1]: false,
              [name2]: i + 1
            })
          }
        }
      }
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