const app = getApp();
var startPoint
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Longitude: '',
    Latitude: '',
    PlaceName: '', //临时存储地点名称
    PlaceAddress: '', //临时存储地点地址
    Id: '', //临时存储Id
    Time: '', //临时存储时间
    Device: '',
    Number: '', //存放故障马桶设备MAC地址
    ShowModelStatus: false,
    ShowMenuStatus: false,
    Markers: [],
    AdvertiseText:'今日享用，赢取迪士尼门票',
    AdverStatus:false,
    AdverWindow:0,
    LanyaStatus:false,

    AdvertiseSrc:'',
    AdvertiseTitle:''
  },

  CancelWindow:function(){
    var that = this;
    that.setData({
      AdverWindow:0,
      AdverStatus:true
    })
  },

  Filter:function(testId){
    var markerlist = this.data.Markers
    for (var i = 0; i < markerlist.length; i++){
      if (markerlist[i].id === testId){
        return i
      }
    }
  },

  Advertisement:function(){
    wx.navigateTo({
      url: '../advertisement/advertisement',
    })
  },


  ShowView:function(){
    wx.navigateTo({
      url: '../login/login',
    })
  },

  HideView: function() {
    var that = this;
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    that.animation = animation;
    animation.translateX(0).step()
    that.setData({
      AnimationData: animation.export()
    })
    setTimeout(function() {
      animation.translateX(0).step()
      that.setData({
        AniamtionData: animation.export(),
        ShowMenuStatus: false
      })
    }.bind(that), 200)
  },

  Markertap: function(e) {
    var that = this;
    var id = that.Filter(e.markerId)
    that.setData({
      PlaceName: that.data.Markers[id].name,
      PlaceAddress: that.data.Markers[id].detail_address,
      Id: id,
      Time: that.data.Markers[id].business_hours
    });
    app.globalData.SearchName = that.data.Markers[id].name
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    that.animation = animation
    animation.translateY(300).step()
    that.setData({
      AniamtionData: animation.export(),
      ShowModelStatus: true
    })
    setTimeout(function() {
      animation.translateY(0).step()
      that.setData({
        AniamtionData: animation.export()
      })
    }.bind(that), 200)
  },

  Scanning: function() {
    var that = this
    if (!app.globalData.hasuserInfo){
     wx.showModal({
       title: '提示',
       content: '请先登录',
       success(res){
         if (res.confirm){
           wx.navigateTo({
             url: '../login/login',
           })
         }
         else if (res.cancel){
           wx.showToast({
             title: '您将无法使用功能',
             icon:'none'
           })
         }
       }
     })
    }
    else{
      wx.request({
        url: 'https://'+app.globalData.Api+'/api/query_pay_state',
        header: {
          'content-type': 'application/json'
        },
        method: 'GET',
        data: {
          openid: app.globalData.Openid
        },
        success(res){
          if (res.data.status != 0){
            wx.closeBluetoothAdapter({
              success: function(res) {
                console.log("断开蓝牙连接")
              },
            })
            setTimeout(function(){
              wx.openBluetoothAdapter({
                success: function (res) {
                  wx.scanCode({
                    success(res) {
                      var address = decodeURIComponent(res.path)
                      address = address.substring(address.length - 17)
                      console.log('扫码获得MAC地址' + address)
                      that.setData({
                        Device: address
                      })
                      app.globalData.DeviceId = address
                      app.globalData.ScanCode = true
                      wx.redirectTo({
                        url: '../lanya/lanya',
                      })
                    },
                    fail() {
                      console.log("扫码失败")
                    }
                  })
                },
                fail() {
                  wx.showModal({
                    title: '提示',
                    content: '请检查手机蓝牙是否打开',
                  })
                }
              })
            },500)
          }
          else{
            wx.showModal({
              title: '提示',
              content: '检测到上次费用尚未支付',
              confirmText:'去支付',
              success(res){
                if (res.confirm){
                  wx.navigateTo({
                    url: '../consume/consume',
                  })
                }
              }
            })
          }
        }
      })
    }
  },

  OpenDetail: function() {
    wx.navigateTo({
      url: '../equipment/equipment',
    })
  },
  HideModel: function() {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      AnimationData: animation.export(),
    })
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        AnimationData: animation.export(),
        ShowModelStatus: false,
      })
    }.bind(this), 200)
  },

  Navigation: function() {
    var that = this;
    var id = that.data.Id;
    wx.openLocation({
      latitude: parseFloat(that.data.Markers[id].latitude),
      longitude: parseFloat(that.data.Markers[id].longitude),
      success() {
        console.log("调用导航成功");
      },
      fail() {
        console.log("调用导航失败");
      }
    })
  },

  Calling: function() {
    var that = this;
    var index = that.data.Id;
    var number = that.data.Markers[index].phone_number;
    wx.makePhoneCall({
      phoneNumber: number,
      success: function() {
        console.log("拨打电话成功")
      },
      fail() {
        console.log("拨打电话失败")
      }
    })
  },

  Relocate: function() {
    this.Mapctx = wx.createMapContext('Mymap', this);
    this.Mapctx.moveToLocation();
  },

  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        that.setData({
          Longitude: res.longitude,
          Latitude: res.latitude,
        })
        console.log("获取地理位置信息成功" + that.data.Longitude + '  ' + that.data.Latitude);
      },
      fail() {
        wx.showToast({
          title: '获取地理位置失败',
          icon: 'none'
        })
      }
    })
    wx.request({
      url: 'https://'+app.globalData.Api+'/api/query_install_location',
      header:{
        "content-type":'application/json'
      },
      method:'GET',
      success(res){
        that.setData({
          Markers:res.data.rows
        })
        for (var i = 0; i < that.data.Markers.length; i++){
          var name1 = 'Markers[' + i +'].iconPath'
          var name2 = 'Markers[' + i +'].width'
          var name3 = 'Markers[' + i + '].height'
          that.setData({
            [name1]: '../images/icon.png',
            [name2]:50,
            [name3]:50
          })
        }
      }
    })
    var macaddress = decodeURIComponent(options.scene)
    console.log('外部获取参数'+macaddress)
    if (options.scene != undefined){
      app.globalData.DeviceId = macaddress
    }
    else{
      app.globalData.DeviceId = ''
    }
    app.globalData.ScanCode = false
    app.globalData.TempId = '',
    app.globalData.FailConnectTime = 0
    app.globalData.FailAdaptTime = 0
    if (app.globalData.DeviceId != ''){
      wx.showLoading({
        title: '正在加载中',
      })
    }
    setTimeout(function(){
      wx.request({
        url: 'https://' + app.globalData.Api + '/api/query_pay_state',
        method: 'GET',
        header: {
          "content-type": 'application/json'
        },
        data: {
          openid: app.globalData.Openid
        },
        success(res) {
          if (res.data.status === 0) {
            wx.hideLoading()
            wx.showModal({
              title: '提示',
              content: '检测到您上次尚未支付',
              confirmText: '查看详情',
              success(res) {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '../consume/consume',
                  })
                }
              }
            })
          }
          else{
            if (app.globalData.DeviceId != '') {
              wx.closeBluetoothAdapter({
                success: function(res) {
                  console.log("断开蓝牙连接")
                },
              })
              setTimeout(function(){
                wx.openBluetoothAdapter({
                  success: function (res) {
                    console.log('开启蓝牙成功')
                    app.globalData.ScanCode = true
                    wx.redirectTo({
                      url: '../lanya/lanya',
                    })
                  },
                  fail() {
                    wx.hideLoading()
                    wx.showModal({
                      title: '提示',
                      content: '请检查蓝牙是否打开',
                    })
                  }
                })
              }, 1000)
            }
          }
        }
      })
    },500)
    wx.request({
      url: 'https://' + app.globalData.Api +'/api/query_advertisement',
      method:'GET',
      success(res){
        that.setData({
          AdvertiseSrc:res.data.rows.img_url,
          AdvertiseTitle:res.data.rows.title,
          AdverWindow: Number(res.data.rows.status),
          AdverContent: res.data.rows.content
        })
        app.globalData.AdverContent = that.data.AdverContent
        if (app.globalData.DeviceId != ''){
          that.setData({
            AdverWindow: 0
          })
        }
      }
    })
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