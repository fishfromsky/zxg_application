const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Guzhang:[],
    src:'',
    EquipmentMac:'',
    TextInput:'',
    MachineColor:'white',
    LightColor:'white',
    WenduColor:'white',
    LanyaColor:'white',
    QuantaoColor:'white',
    ShebeiColor:'white',
    ShowText:false,
    SaomaSuccess:false
  },

  TextInput:function(res){
    this.setData({
      TextInput:res.detail.value
    })
  },

  Saoma:function(){
    var that = this;
    wx.scanCode({
      success:function(res){
        wx.showToast({
          title: '扫码成功',
        })
        console.log(res.path)
        var addr = decodeURIComponent(res.path)
        that.setData({
          EquipmentMac: addr.substring(addr.length - 17),
          SaomaSuccess:true
        })
        console.log(res)
      },
      fail(){
        wx.showToast({
          title: '扫码失败',
          icon:'none'
        })
      }
    })
  },

  Machine:function(){
    const index = this.data.Guzhang.indexOf('电机故障')
    if (index === -1){
      this.data.Guzhang.push('电机故障')
      this.setData({
        MachineColor:'#cdcdcd',
        ShowText:true
      })
    }
    else{
      this.data.Guzhang.splice(index,1)
      this.setData({
        MachineColor:'white'
      })
      if (this.data.Guzhang.length === 0){
        this.setData({
          ShowText:false
        })
      }
    }
  },

  Lightbulb:function(){
    const index = this.data.Guzhang.indexOf('夜灯故障')
    if (index === -1){
      this.data.Guzhang.push('夜灯故障')
      this.setData({
        LightColor:'#cdcdcd',
        ShowText:true
      })
    }
    else{
      this.data.Guzhang.splice(index,1)
      this.setData({
        LightColor:'white'
      })
      if (this.data.Guzhang.length === 0) {
        this.setData({
          ShowText: false
        })
      }
    }
  },

  Temperature:function(){
    const index = this.data.Guzhang.indexOf('温度故障')
    if (index === -1){
      this.data.Guzhang.push('温度故障')
      this.setData({
        WenduColor:'#cdcdcd',
        ShowText:true
      })
    }
    else{
      this.data.Guzhang.splice(index,1)
      this.setData({
        WenduColor:'white'
      })
      if (this.data.Guzhang.length === 0) {
        this.setData({
          ShowText: false
        })
      }
    }
  },

  Lanya:function(){
    const index = this.data.Guzhang.indexOf('蓝牙故障')
    if (index === -1){
      this.data.Guzhang.push('蓝牙故障')
      this.setData({
        LanyaColor:'#cdcdcd',
        ShowText:true
      })
    }
    else{
      this.data.Guzhang.splice(index,1)
      this.setData({
        LanyaColor:'white'
      })
      if (this.data.Guzhang.length === 0) {
        this.setData({
          ShowText: false
        })
      }
    }
  },

  Destroy:function(){
    const index = this.data.Guzhang.indexOf('设备损坏')
    if (index === -1){
      this.data.Guzhang.push('设备损坏')
      this.setData({
        ShebeiColor:'#cdcdcd',
        ShowText:true
      })
    }
    else{
      this.data.Guzhang.splice(index,1)
      this.setData({
        ShebeiColor:'white'
      })
      if (this.data.Guzhang.length === 0) {
        this.setData({
          ShowText: false
        })
      }
    }
  },
  
  Qita: function () {
    const index = this.data.Guzhang.indexOf('其他')
    if (index === -1) {
      this.data.Guzhang.push('其他')
      this.setData({
        QuantaoColor: '#cdcdcd',
        ShowText: true
      })
    }
    else {
      this.data.Guzhang.splice(index, 1)
      this.setData({
        QuantaoColor: 'white'
      })
      if (this.data.Guzhang.length === 0) {
        this.setData({
          ShowText: false
        })
      }
    }
  },

  Submit:function(){
    var that = this
    if (this.data.ShowText & this.data.SaomaSuccess & this.data.src != ''){
      wx.showToast({
        title: '提交成功',
      })
      var faulttypes = that.data.Guzhang.join(',')
      console.log('MAC地址'+that.data.EquipmentMac)
      console.log('故障类型'+faulttypes)
      console.log('自定义内容'+that.data.TextInput)
      wx.uploadFile({
        url: 'https://' + app.globalData.Api +'/api/problems',
        filePath: that.data.src,
        name: 'picture',
        method:'POST',
        header:{
          'content-type':'application/x-www-form-urlencoded' 
        },
        formData:{
          mac_address:that.data.EquipmentMac,
          fault_types:faulttypes,
          content:that.data.TextInput
        },
        success(res){
          console.log(res)
          wx.redirectTo({
            url: '../index/index',
          })
        }
      })
    }
    else if (!this.data.SaomaSuccess){
      wx.showToast({
        title: '请扫描设备二维码',
        icon:'none'
      })
    }
    else if (this.data.src === ''){
      wx.showToast({
        title: '请拍照后上传',
        icon:'none'
      })
    }
    else{
      wx.showToast({
        title: '提交内容为空',
        icon:'none'
      })
    }
  },

  Camera:function(){
    var that = this;
    wx.chooseImage({
      success: function(res) {
        var tempFilePaths = res.tempFilePaths
        that.setData({
          src:tempFilePaths[0]
        })
      },
    })
  },

  ShowPicture:function(){
    var that = this;
    wx.previewImage({
      urls: [that.data.src],
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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