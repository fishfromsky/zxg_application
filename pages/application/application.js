const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    CompanyStatus:true,
    SinglePerson:false,
    Money:0,
    FapiaoTaitou:'',
    Shuihao:'',
    Gengduo:'',
    Email:'',
    PhoneNumber:'',
    PostAddress:'',
    Ticket:'',
    PostNumber:'',
    City:''
  },

  Number:function(res){
    this.setData({
      PostNumber:res.detail.detail.value
    })
  },

  City:function(res){
    this.setData({
      City:res.detail.detail.value
    })
  },
  
  RadioChange:function(res){
    if (res.detail.value==='Company'){
      this.setData({
        CompanyStatus:true,
        SinglePerson:false
      })
    }
    else{
      this.setData({
        CompanyStatus:false,
        SinglePerson:true
      })
    }
  },

  FapiaoTaitou:function(res){
    var that = this;
    that.setData({
      FapiaoTaitou:res.detail.detail.value
    })
  },

  Shuihao:function(res){
    var that = this;
    that.setData({
      Shuihao:res.detail.detail.value
    })
  },

  More:function(res){
    var that = this;
    that.setData({
      Gengduo:res.detail.detail.value
    })
  },

  Email:function(res){
    var that = this;
    that.setData({
      Email:res.detail.detail.value
    })
  },

  Phone:function(res){
    var that = this;
    that.setData({
      PhoneNumber:res.detail.detail.value
    })
  },

  Post:function(res){
    var that = this;
    that.setData({
      PostAddress:res.detail.detail.value
    })
  },

  Sending:function(){
    if (this.data.CompanyStatus){
      if (this.data.FapiaoTaitou!=''&this.data.Shuihao!=''&this.data.Email!=''&this.data.PhoneNumber!=''&this.data.PostNumber!=''&this.data.Number!=''&this.data.City!=''){
        wx.showToast({
          title: '提交成功',
        })
        wx.request({
          url: 'https://'+app.globalData.Api+'/api/submit_invoice',
          method:'POST',
          header:{
            "content-type":'application/x-www-form-urlencoded'
          },
          data:{
            openid:app.globalData.Openid,
            unit: '单位',
            invoice_title:this.data.FapiaoTaitou,
            ein:this.data.Shuihao,
            more_content:this.data.Gengduo,
            total_amount: app.globalData.Consume,
            email:this.data.Email,
            consumption_id:this.data.Ticket,
            phone_number:this.data.PhoneNumber,
            mailing_address:this.data.City,
            post_number:this.data.Number,
            detail_address:this.data.PostAddress
          },
          success(res){
            console.log('提交发票成功'+res.data)
            wx.redirectTo({
              url: '../index/index',
            })
          },
          fail(res){
            console.log(res)
          }
        })
      }
      else{
        wx.showToast({
          title: '必填项不能为空！',
          icon:'none'
        })
      }
    }
    else{
      if (this.data.FapiaoTaitou != '' && this.data.Email != '' && this.data.PhoneNumber != '' & this.data.PostNumber != ''&this.data.Number!=''&this.data.City!=''){
        wx.showToast({
          title: '提交成功',
        })
        wx.request({
          url: 'https://' + app.globalData.Api + '/api/submit_invoice',
          method: 'POST',
          header: {
            "content-type": 'application/x-www-form-urlencoded'
          },
          data: {
            openid: app.globalData.Openid,
            unit: '个人',
            invoice_title: this.data.FapiaoTaitou,
            ein: '0',
            more_content: this.data.Gengduo,
            total_amount: app.globalData.Consume,
            email: this.data.Email,
            consumption_id: this.data.Ticket,
            phone_number: this.data.PhoneNumber,
            mailing_address: this.data.City,
            post_number: this.data.Number,
            detail_address: this.data.PostAddress
          },
          success(res) {
            console.log('提交发票成功' + res.data)
            wx.redirectTo({
              url: '../index/index',
            })
          },
        })
      }
      else{
        wx.showToast({
          title: '必填项不能为空',
          icon:'none'
        })
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var ticketid = app.globalData.TicketId.join(',')
    this.setData({
      Money: app.globalData.Consume,
      Ticket:ticketid
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