const app = getApp()
var Mytime
var time;
var PayStatus;
var TotalAdpatTime
var ChosenListLength
Page({
  /**
   * 页面的初始数据
   */
  data: {
    Consumption_amount: 0.01,
    Temperature: '',

    BLEScan: false,
    ScanView: false,
    BLEconnect: false,
    ServicesID: ['ffb0', 'fff0'], //筛选设备UUID
    NeedUseService: ['ffe0', 'ffe5', 'fff0', 'ffc0'], //需要用到的服务，用在初始化服务，必须填入
    DeviceList: [],
    Name: [],
    ConnectedDeviceId: '',
    LoadList: false,
    BLECanUse: false,
    WenduStatus: false,
    Wendu: false,
    AutoDisConnect: false,              //强制断开蓝牙功能状态
    SrcPath: '',                        //扫码结果路径
    AlarmList:[],                       //存放报警类型
    AlarmStatus:true,                       //是否没有接收到换圈完成指令

    ServicesID: ['ffb0', 'fff0'], //筛选设备UUID
    ReadServices: ['ffe0', 'ffe4'], //透传读服务
    WriteServices: ['ffe5', 'ffe9'], //透传写服务
    GPIOServices: ['fff0', 'fff1', 'fff2', 'fff3'], //GPIO服务
    SafetyKeyServices: ['ffc0', 'ffc1', 'ffc2'], //防劫持密钥功能
    NeedUseService: ['ffe0', 'ffe5', 'fff0', 'ffc0'], //需要用到的服务，用在初始化服务，必须填入


    FunctionItems: [{
        name: 'TTM',
        value: '透传',
        checked: true,
        disabled: true
      },
      {
        name: 'GPIO',
        value: 'GPIO',
        checked: false,
        disabled: false
      },
      {
        name: 'SafetyKey',
        value: '防劫持',
        checked: false,
        disabled: false
      },
    ],

    cardCur: 0,

    swiperList: [],          //轮播图


    UUIDReadServices: '', //读数据服务
    UUIDReadCharacteristic: '', //读数据特征值
    UUIDWriteServices: '', //发数据服务
    UUIDWriteCharacteristic: '', //发数据特征值

    UUIDGPIOServices: '', //GPIO服务
    UUIDGPIOSetCharacteristic: '', //GPIO输出设置
    UUIDGPIONotifyCharacteristic: '', //GPIO输入状态通知
    UUIDGPIOStateCharacteristic: '', //GPIO输出状态设置

    UUIDSafetyKeyServices: '', //防劫持服务
    UUIDSafetyKeyCharacteristic: '', //防劫持输出设置
    UUIDSafetyKeyNotifyCharacteristic: '', //防劫持输入状态通知   

    ServicesList: [], //服务列表
    CharacteristicList: [], //特征值列表

    /////////////////////////////////////////////////指令///////////////////////////////////////////////////////

    HuantaoData: [0x5A, 0xAA, 0xB5, 0x00, 0x75], //换套
    StopHuantaoData: [0x5A, 0xAF, 0xB5, 0x00, 0x72], //停止换套
    YedengData: [0x5A, 0xB1, 0xB5, 0x00, 0x0C], //夜灯
    ChuchouData: [0x5A, 0xB4, 0xB5, 0x00, 0x0F], //除臭
    WenduData: [0x5A, 0xD4, 0xB5, 0x00, 0x2F], //常温温度
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////

    YedengCount: 1, //按钮使用次数
    HuanquanCount: 1,
    ChuchouCount: 1,
    Value: 32
  },

  Transfer:function(){
    wx.navigateTo({
      url: '../join/join',
    })
  },

  Timer:function(){                                 //定义计时器，计时器到10s就判断是否需要断开连接
    var that = this;
    time = 0
    Mytime = setInterval(function () {
      that.DisConnect()
      console.log(time)
      if (time === 10) {
        time = 0
      }
    }, 1000)
  },

  DisConnect:function(){                                //定时器已经到10s，判断是否与设备断开连接
    var that = this
    time++
    if (time === 10){
      if (PayStatus){
        wx.showModal({
          title: '提示',
          content: '小程序长时间未操作，已断开和设备的连接',
        })
        that.Reset()                                     //将各功能复位
        clearInterval(Mytime)    //清除计时器
        setTimeout(function () {
          wx.closeBLEConnection({
            deviceId: that.data.ConnectedDeviceId,
            success: function (res) {
              console.log('关闭蓝牙连接')
            },
          })
          wx.closeBluetoothAdapter({
            success: function (res) {
              console.log('卸载蓝牙')
            },
          })
        }, 2000)
        setTimeout(function () {
          wx.hideLoading()
          wx.redirectTo({
            url: '../index/index',
          })
        }, 3000)
      }
    }
  },

  RenturnData: function(data, res) {                             //返回各种功能对应指令在特定温度下的指令值(因为相同功能在不同温度下指令值也不一样)
    var temp = data
    if (res === '32') {
      temp.slice(3, 1, 0x20)
    }
    if (res === '34') {
      temp.splice(3, 1, 0x22)
    }
    if (res === '36') {
      temp.splice(3, 1, 0x24)
    }
    if (res === '38') {
      temp.splice(3, 1, 0x26)
    }
    if (res === '40') {
      temp.splice(3, 1, 0x28)
    }
    if (res === '42') {
      temp.splice(3, 1, 0x2A)
    }
    var count = 0
    for (var i = 0; i < temp.length - 1; i++) {
      var num = temp[i]
      count = count + num
    }
    var result = count ^ 0xCC             //与0xCC做异或
    temp.splice(4, 1, result)
    return temp
  },

  cardSwiper(e) {
    this.setData({
      cardCur: e.detail.current
    })
  },

  Reset:function(){                             //功能复位
    var that = this
    if (that.data.YedengCount % 2 != 1) {          //若夜灯未关闭，关闭夜灯
      var content = that.RenturnData(that.data.YedengData, that.data.Temperature)
      const buffer = that.generate_buffer(content)
      console.log('关闭夜灯' + that.data.YedengData)
      that.WriteData(buffer)
    }
    setTimeout(function () {
      if (that.data.ChuchouCount % 2 != 1) {            //若除臭未关闭，关闭除臭
        var content = that.RenturnData(that.data.ChuchouData, that.data.Temperature)
        const buffer = that.generate_buffer(content)
        console.log('关闭除臭' + that.data.ChuchouData)
        that.WriteData(buffer)
      }
    }, 1000)
    setTimeout(function () {                  //温度复位为常温
      var content = [0x5A, 0xD4, 0xB5, 0x00, 0x2F]
      const buffer = that.generate_buffer(content)
      console.log('温度复位' + content)
      that.WriteData(buffer)
    }, 2000)
  },

  EndUse: function() {
    var that = this
    wx.showLoading({
      title: '正在复位',
    })
    clearInterval(Mytime)    //清除计时器
    that.Reset()
    setTimeout(function() {
      wx.closeBLEConnection({
        deviceId: that.data.ConnectedDeviceId,
        success: function(res) {
          console.log('关闭蓝牙连接')
        },
      })
      wx.closeBluetoothAdapter({
        success: function(res) {
          console.log('卸载蓝牙')
        },
      })
    }, 2000)
    setTimeout(function() {
      wx.hideLoading()
      wx.redirectTo({
        url: '../index/index',
      })
    }, 3000)
  },

  ab2hex: function(buffer) {
    var hexArr = Array.prototype.map.call(
      new Uint8Array(buffer),
      function(bit) {
        return ('00' + bit.toString(16)).slice(-2)
      }
    )
    return hexArr.join('');
  },

  CheckDevice: function(deviceId) {                    //判断设备是否是我们要连接的设备，仅仅IOS系统下该函数生效
    var that = this
    var address = deviceId
    wx.createBLEConnection({
      deviceId: address,
      success: function(res) {
        wx.getBLEDeviceServices({
          deviceId: address,
          success: function(res) {
            var serviceList = res.services                    //获取附近的设备
            for (var i = 0; i < serviceList.length; i++) {
              if (serviceList[i].uuid.substring(4, 8) == '180A') {          //获取该设备180A的服务           
                var serviceId = serviceList[i].uuid
                break
              }
            }
            wx.getBLEDeviceCharacteristics({                 //获取180A服务下2A23的特征值
              deviceId: address,
              serviceId: serviceId,
              success: function(res) {
                var characlist = res.characteristics;
                for (var i = 0; i < characlist.length; i++) {
                  if (characlist[i].uuid.substring(4, 8) === '2A23') {
                    var cc = characlist[i].uuid
                    break
                  }
                }
                wx.readBLECharacteristicValue({                     //对该特征值进行读操作
                  deviceId: address,
                  serviceId: serviceId,
                  characteristicId: cc,
                  success: function(res) {
                    function ab2hex(buffer) {                        //对该特征值进行剪辑，拼接操作
                      let hexArr = Array.prototype.map.call(
                        new Uint8Array(buffer),
                        function(bit) {
                          return ('00' + bit.toString(16)).slice(-2)
                        }
                      )
                      return hexArr.join('');
                    }
                    wx.onBLECharacteristicValueChange(function(res) {
                      if (app.globalData.TempId === ''){                     //防止与后面连接成功后监听蓝牙特征值混淆
                        var mac = ab2hex(res.value)
                        var maclist = []
                        for (var i = 14; i >= 0; i = i - 2) {                    //剪辑拼接后获得该设备的MAC地址
                          if (i != 6 & i != 8) {
                            maclist.push(mac.substr(i, 2))
                          }
                        }
                        var macadress = maclist.join(':').toUpperCase()
                        console.log('搜索到MAC地址' + macadress)
                        if (macadress === app.globalData.DeviceId) {
                          console.log('匹配成功' + macadress)
                          wx.hideLoading()
                          wx.showToast({
                            title: '匹配成功',
                          })
                            app.globalData.TempId = address
                            that.setData({
                              ConnectedDeviceId:address
                            })
                            that.Connecting()
                        } else {
                          if (TotalAdpatTime == ChosenListLength){
                            that.ReAdapt()
                          }
                          wx.closeBLEConnection({
                            deviceId: address,
                            success: function (res) {
                              console.log('断开连接，连接下一个设备')
                            },
                          })
                        }
                      }
                    })
                  },
                })
              },
            })
          },
        })
      },
      fail(res) {
        console.log('蓝牙连接失败')
      }
    })
  },

  Payment: function() {                         //支付函数
    var that = this
    wx.request({
      url: 'https://' + app.globalData.Api + '/api/add_records_of_consumption',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        openid: app.globalData.Openid,
        mac: app.globalData.DeviceId,
        consumption_amount: that.data.Consumption_amount
      },
      success(res) {
        console.log('添加消费记录成功' + JSON.stringify(res))
        wx.request({
          url: 'https://' + app.globalData.Api + '/api/pay',
          method: 'GET',
          header: {
            'content-type': 'applciation/json'
          },
          data: {
            openid: app.globalData.Openid,
            total_fee: that.data.Consumption_amount * 10 * 10
          },
          success(data) {
            wx.requestPayment({
              timeStamp: data.data.timeStamp,
              nonceStr: data.data.nonceStr,
              package: data.data.package,
              signType: 'MD5',
              paySign: data.data.paySign,
              success(res) {
                console.log('支付成功')
                PayStatus = true                 //计时器生效
                time=0
                wx.request({
                  url: 'https://' + app.globalData.Api + '/api/modify_pay_state',
                  method: 'POST',
                  header: {
                    'content-type': 'application/x-www-form-urlencoded'
                  },
                  data: {
                    openid: app.globalData.Openid,
                  },
                  success(res) {
                    console.log('成功修改支付状态')
                  },
                })
              },
              fail() {
                wx.hideLoading()
                console.log('支付失败')
                PayStatus = true;                 //计时器生效
                time = 0;
                wx.showModal({
                  title: '提示',
                  content: '您将无法享受换圈服务',
                })
              }
            })
          }
        })
      }
    })
  },

  JudgeIos: function() {                      //判断蓝牙设备是我们需要连接的设备
    var that = this
    wx.startBluetoothDevicesDiscovery({
      success: function(res) {
        console.log('开始搜索蓝牙设备')
      },
    })
    wx.onBluetoothDeviceFound(function(res) {
      wx.getBluetoothDevices({
        success: function(res) {
          that.setData({
            DeviceList: res.devices
          })
          console.log(res)
        },
      })
    })
    wx.showLoading({
      title: '正在搜索设备',
      mask: true
    })
    setTimeout(function() {
      wx.hideLoading()
      var ChosenList = []              //获得所有名字叫“ZhiXiaoGe-B"的设备名称
      for (var i = 0; i < that.data.DeviceList.length; i++) {
        if (that.data.DeviceList[i].name === 'ZhiXiaoGe-B' & that.data.DeviceList[i].RSSI > -80) {
          ChosenList.push(that.data.DeviceList[i])
        }
      }
      ChosenList.sort(function(a, b) {          //将设备按照信号强度大小从大到小排序
        return b.RSSI - a.RSSI
      })
      console.log(ChosenList)
      wx.stopBluetoothDevicesDiscovery({
        success: function(res) {
          console.log('停止搜索')
        },
      })
      wx.showLoading({
        title: '匹配设备中',
        mask: true
      })
      TotalAdpatTime = 0
      ChosenListLength = ChosenList.length
      if (ChosenListLength == 0){
        that.ReAdapt()
      }
      for (var i = 0; i < ChosenList.length; i++) {
        (function(i) {
          setTimeout(function() {
            if (app.globalData.TempId != '') {
              console.log('匹配成功')
              return;
            } else {
              console.log(i)
              TotalAdpatTime++
              that.CheckDevice(ChosenList[i].deviceId)     //对每一个设备进行判断匹配
            }
          }, 2000)
        })(i)
      }
    }, 2000)
  },

  ReAdapt:function(){
    var that = this
    if (app.globalData.FailAdaptTime != 2) {
      wx.showLoading({
        title: '正在重新匹配',
        mask: true
      })
      wx.closeBluetoothAdapter({
        success: function (res) {
          console.log("断开蓝牙")
        }
      })
      setTimeout(function () {
        wx.openBluetoothAdapter({
          success: function (res) {
            console.log("打开蓝牙")
          }
        })
      }, 500)
      setTimeout(function () {
        wx.hideLoading()
        app.globalData.FailAdaptTime++
        that.JudgeIos()
      }, 1000)
    }
    else{
      wx.showToast({
        title:"匹配失败",
        icon:'none'
      })
      wx.hideLoading()
      wx.request({
        url: 'https://' + app.globalData.Api + '/api/submit_alarm_information',
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        data: {
          mac_address: app.globalData.DeviceId,
          content: '连接出错'
        },
        success(res) {
          console.log(res)
        }
      })
      wx.closeBluetoothAdapter({
        success: function (res) {
          console.log('卸载蓝牙')
        },
      })
      wx.redirectTo({
        url: '../index/index',
      })
      return
    }
  },

  setAlarm: function(info) {
    var that = this
    if (app.globalData.DeviceCate === 'android') {                      //向后台发送报警信息
      var deviceid = that.data.ConnectedDeviceId
    } else {
      var deviceid = app.globalData.DeviceId
    }
    wx.request({
      url: 'https://' + app.globalData.Api + '/api/submit_alarm_information',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      data: {
        mac_address: deviceid,
        content: info
      },
      success(res) {
        console.log(res)
      }
    })
  },

  ShowErrorModel:function(error){                          //弹出故障类型框
    var that = this
    wx.showModal({
      title: '温馨提示',
      content: error,
      success(res) {
        if (res.confirm) {
          clearInterval(Mytime)
          wx.closeBLEConnection({
            deviceId: that.data.ConnectedDeviceId,
            success: function (res) {
              console.log('关闭蓝牙连接')
            },
          })
          wx.closeBluetoothAdapter({
            success: function (res) {
              console.log('卸载蓝牙')
            },
          })
          wx.redirectTo({
            url: '../index/index',
          })
        }
        if (res.cancel){
          PayStatus = true
          time=0
        }
        that.setData({
          BLECanUse: false
        })
      }
    })
  },

  Sendmessage:function(content){
    var that = this
    wx.request({
      url: 'https://' + app.globalData.Api + '/api/send_message',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      data: {
        mac_address: that.data.ConnectedDeviceId,
        content: content
      },
      success(res) {
        console.log(res)
      }
    })
  },

  JudgeError(info){                                                //故障信息分类
    if (info.substring(2, 4).toLocaleUpperCase() === 'FF'){
      wx.hideLoading()
      var that = this
      info = info.substring(14, 16)
      var detail = parseInt(info, 16).toString(2)
      function insertStr(soure, start, newStr) {
        return soure.slice(0, start) + newStr + soure.slice(start);
      }
      if (detail.length < 8){
        for (var i = detail.length; i < 8; i++){
          detail = insertStr(detail, 0, '0')
        }
      }
      console.log(detail)
      if (detail[0] === '1') {
        if (that.data.AlarmList.indexOf('套用完') === -1) {
          that.setAlarm('套用完')
          that.data.AlarmList.push('套用完')
          if (detail[1] === '0'){
            that.ShowErrorModel('套用完，请使用其他设备')
            that.Sendmessage('套用完')
          }
          console.log('套用完')
        }
      }
      if (detail[1] === '1') {
        if (that.data.AlarmList.indexOf('卡套，电机电流过载') === -1) {
          that.setAlarm('卡套，电机电流过载')
          that.data.AlarmList.push('卡套，电机电流过载')
          that.ShowErrorModel('电机故障，请使用其他设备')
          that.Sendmessage('卡套')
          console.log('卡套')
        }
      }
      if (detail[2] === '1') {
        if (that.data.AlarmList.indexOf('座温传感器出错') === -1) {
          that.setAlarm('座温传感器出错')
          that.data.AlarmList.push('座温传感器出错')
          console.log('温度传感器出错')
        }
      }
      if (detail[3] === '1' | detail[4] === '1') {
        if (that.data.AlarmList.indexOf('设备不用') === -1) {
          that.setAlarm('设备不用')
          that.data.AlarmList.push('设备不用')
          console.log('设备不用')
        }
      }
      if (detail.substring(5) === '000') { }
      if (detail.substring(5) === '001') {
        if (that.data.AlarmList.indexOf('2天无人使用') === -1) {
          that.setAlarm('2天无人使用')
          that.data.AlarmList.push('2天无人使用')
          console.log('2天无人使用')
        }
      }
      if (detail.substring(5) === '010') {
        if (that.data.AlarmList.indexOf('3天无人使用') === -1) {
          that.setAlarm('3天无人使用')
          that.data.AlarmList.push('3天无人使用')
          console.log('3天无人使用')
        }
      }
      if (detail.substring(5) === '011') {
        if (that.data.AlarmList.indexOf('5天无人使用') === -1) {
          that.setAlarm('5天无人使用')
          that.data.AlarmList.push('5天无人使用')
          console.log('5天无人使用')
        }
      }
      if (detail.substring(5) === '100') {
        if (that.data.AlarmList.indexOf('7天无人使用') === -1) {
          that.setAlarm('7天无人使用')
          that.data.AlarmList.push('7天无人使用')
          console.log('7天无人使用')
        }
      }
      if (detail.substring(5) === '101') {
        if (that.data.AlarmList.indexOf('15天无人使用') === -1) {
          that.setAlarm('15天无人使用')
          that.data.AlarmList.push('15天无人使用')
          console.log('15天无人使用')
        }
      }
      console.log(that.data.AlarmList)
    }
  },

  NotifyChange: function(info) {                                 //十六进制转二进制并判断报警信息
    var that = this
    if (info.substring(2, 4).toLocaleUpperCase() === 'AF') {
      wx.hideLoading()
      wx.showToast({
        title: '换圈完成',
      })
      that.Payment()
      that.setData({
        AlarmStatus: false
      })
    }
  },

  Huanquan:function(){
    var that = this
    var content = that.RenturnData(that.data.HuantaoData, that.data.Temperature);
    const buffer = that.generate_buffer(content);
    console.log("写入换圈数据" + content)
    wx.showLoading({
      title: '正在换圈勿落座',
      mask: true
    })
    that.WriteData(buffer);
  },

  Connecting: function() {
    var that = this;
    console.log(that.data.ConnectedDeviceId)
    wx.showLoading({
      title: '正在连接中',
      mask: true
    })
    wx.createBLEConnection({
      deviceId: that.data.ConnectedDeviceId,
      success: function(res) {
        that.Timer();      //倒计时开始
        console.log('createBLEConnection success:', res)
        wx.showLoading({
          title: '正在初始化',
          mask: true
        })
        that.BLEServicesInit(); //确认已连接，进行服务初始化加载
        setTimeout(function() {
          wx.notifyBLECharacteristicValueChange({
            deviceId: that.data.ConnectedDeviceId,
            serviceId: that.data.UUIDReadServices,
            characteristicId: that.data.UUIDReadCharacteristic,
            state: true,
            success: function(res) {
              console.log('开启监听功能')
            },
          })
          wx.hideLoading();
          wx.showToast({
            title: '初始化成功',
          })
          wx.showLoading({
            title: '正在调节座温',
            mask: true
          })
          var content = that.RenturnData(that.data.WenduData, that.data.Temperature)
          const buffer = that.generate_buffer(content)
          console.log('写入温度数据' + content)
          that.WriteData(buffer)
          setTimeout(function() {
            wx.onBLECharacteristicValueChange(function(res) {
              var info = that.ab2hex(res.value)
              console.log(info)
              that.NotifyChange(info)
            })
            that.Huanquan()
          }, 2000)
          setTimeout(function () {
            wx.hideLoading()
            wx.onBLECharacteristicValueChange(function (res) {
              var info = that.ab2hex(res.value)
              console.log(info)
              that.JudgeError(info)
            })
          }, 16000)
        }, 3000)
      },
      fail() {
        wx.showToast({
          title: '连接失败',
          icon: 'none'
        })
        setTimeout(function() {
          if (app.globalData.FailConnectTime != 2) {
            wx.showLoading({
              title: '正在自动重连',
            })
            setTimeout(function(){
              wx.closeBluetoothAdapter({
                success: function (res) {
                  console.log("关闭蓝牙")
                }
              })
            }, 500)
            setTimeout(function(){
              wx.openBluetoothAdapter({
                success: function (res) {
                  console.log("打开蓝牙")
                }
              })
            }, 1000)
            setTimeout(function() {
              app.globalData.FailConnectTime++
                that.Connecting()
            }, 1500)
          } else {
            wx.hideLoading()
            wx.request({
              url: 'https://' + app.globalData.Api + '/api/submit_alarm_information',
              method: 'POST',
              header: {
                'content-type': 'application/x-www-form-urlencoded'
              },
              data: {
                mac_address: app.globalData.DeviceId,
                content: '连接出错'
              },
              success(res) {
                console.log(res)
              }
            })
            wx.closeBluetoothAdapter({
              success: function(res) {
                console.log('卸载蓝牙')
              },
            })
            wx.redirectTo({
              url: '../index/index',
            })
            return
          }
        }, 1000)

      }
    })
  },

  BLEServicesInit: function() {
    var that = this;
    //获取服务
    var TimeOut = 10; //超时时长 20*500ms=10s
    var ConnectTimeOut = setInterval(function() {
      wx.getBLEDeviceServices({ //测试服务是否已经下载完
        deviceId: that.data.ConnectedDeviceId,
        success: function(res) { //console.log('ConnectTimeOut', ConnectTimeOut);
          clearInterval(ConnectTimeOut); //跳出循环
          that.setData({
            BLEconnect: true,
            ServicesList: res,
            LoadList: false
          });
          console.log('BLEconnec服务列表', true, that.data.ServicesList);
        },
      });
      if (TimeOut) {
        TimeOut--;
        console.log('TimeOut', TimeOut);
      } else {
        clearInterval(ConnectTimeOut); //关闭循环
        wx.showToast({
          title: '服务获取失败',
          icon: 'none'
        })
      }
    }, 500);

    //获取特征值
    var TimeOut2 = 15;
    var haveServices = false;
    var ConnectTimeOut2 = setInterval(function() {
      if (that.data.BLEconnect & haveServices != true) {
        var LList = [];
        for (var i = 0; i < that.data.NeedUseService.length; i++) {
          LList[i] = that.LoadServices(that.data.NeedUseService[i], that.data.ServicesList.services);
        }
        that.setData({
          UUIDReadServices: LList[0],
          UUIDWriteServices: LList[1],
          UUIDGPIOServices: LList[2],
          UUIDSafetyKeyServices: LList[3],
        })
        haveServices = true;
        that.LoadALLCharacteristic(that.data.ConnectedDeviceId, LList);
      }
      if (haveServices & that.data.CharacteristicList != '' & that.data.LoadList) {
        that.setData({
          UUIDReadCharacteristic: that.LoadServices(that.data.ReadServices[1], that.data.CharacteristicList), //读数据特征值
          UUIDWriteCharacteristic: that.LoadServices(that.data.WriteServices[1], that.data.CharacteristicList), //发数据特征值
          UUIDGPIOSetCharacteristic: that.LoadServices(that.data.GPIOServices[2], that.data.CharacteristicList), //GPIO设置
          UUIDGPIONotifyCharacteristic: that.LoadServices(that.data.GPIOServices[3], that.data.CharacteristicList), //GPIO输入状态通知
          UUIDGPIOStateCharacteristic: that.LoadServices(that.data.GPIOServices[1], that.data.CharacteristicList), //GPIO输出状态设置
          UUIDSafetyKeyCharacteristic: that.LoadServices(that.data.SafetyKeyServices[1], that.data.CharacteristicList), //GPIO输出设置
          UUIDSafetyKeyNotifyCharacteristic: that.LoadServices(that.data.SafetyKeyServices[2], that.data.CharacteristicList), //GPIO输入状态通知  
          BLECanUse: true
        })

        /*if (that.data.FunctionItems[2].checked) {
          that.setSafetyKeyInit(that.data.UUIDSafetyKeyValue[0] + that.data.UUIDSafetyKeyValue[0]);
        }*/
        clearInterval(ConnectTimeOut2); //跳出循环
      }
      if (TimeOut2) {
        TimeOut2--;
        console.log('TimeOut2', TimeOut2);
      } else {
        clearInterval(ConnectTimeOut2); //跳出循环
        console.log('DevicesChoose ERROR');
      }
    }, 500);
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    var that = this;
    time = 0
    PayStatus = false    //支付过后计时有效
    if (app.globalData.ScanCode) {
      if (app.globalData.DeviceCate === 'android') {    //如果是安卓系统就直接根据获取到的MAC地址连接设备
        that.setData({
          ConnectedDeviceId: app.globalData.DeviceId
        })
        console.log('获得值' + that.data.ConnectedDeviceId)
        that.Connecting()
      } else {
        that.JudgeIos()
      }
    }
    wx.request({
      url: 'https://' + app.globalData.Api + '/api/get_amount_temperature',
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      data: {
        mac: app.globalData.DeviceId
      },
      success(res) {
        console.log(app.globalData.DeviceId)
        console.log(res)
        that.setData({
          Consumption_amount: res.data.amount,
          Temperature: res.data.temperature
        })
      }
    })
    wx.request({
      url: 'https://' + app.globalData.Api +'/api/get_shuffling_figure',
      header:{
        'content-type':'application/json'
      },
      method:'GET',
      success(res){
        var swiperlist = res.data.rows
        for (var i = 0; i < swiperlist.length; i++){
          swiperlist[i].id = i
          swiperlist[i].type = 'image'
        }
        that.setData({
          swiperList:swiperlist
        })
        console.log(that.data.swiperList)
      }
    })
  },



  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    wx.hideHomeButton()
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

  },

  LoadServices: function(UUID, SList) { //筛选需要的服务
    var a = '';
    var LServices = '';
    var BUUID = UUID.toLocaleLowerCase(); //小写
    var LUUID = UUID.toLocaleUpperCase(); //大写   
    for (var i = 0; i < SList.length; i++) {
      a = SList[i].uuid;
      a = a.substring(4, 8);
      //筛选128位的服务
      if ((a == BUUID) | (a == LUUID)) {
        LServices = SList[i].uuid
      };
    };
    console.log('LoadServices', LServices);
    return LServices;
  },

  LoadALLCharacteristic: function(devicesID, SList) {
    var that = this;
    //console.log('LoadALLCharacteristic', SList);      
    var TimeNum = 0;
    var Run = true;
    var LoadOutTime = setInterval(function() {
      if (Run) {
        Run = false;
        wx.getBLEDeviceCharacteristics({
          deviceId: devicesID,
          serviceId: SList[TimeNum],
          success: function(res) {
            Run = true;
            if (res.characteristics.length > 0) {
              TimeNum++;
              that.setData({
                CharacteristicList: that.data.CharacteristicList.concat(res.characteristics)
              });
            } else {
              console.log("未能获取服务！正在尝试重新获取")
            }
            if (TimeNum >= SList.length) {
              that.setData({
                LoadList: true
              });
              console.log("获取到的特征值为" + that.data.CharacteristicList);
              clearInterval(LoadOutTime);
            }
          },
        })
      } else {}
    }, 100)
  },

  SendDataHuantao: function() {
    var that = this;
    if (!that.data.BLECanUse) {
      wx.showToast({
        title: '设备故障',
        icon: 'none'
      })
    } else {
      PayStatus = false;
      that.setData({
        AlarmStatus: true
      })
      wx.request({
        url: 'https://' + app.globalData.Api + '/api/query_pay_state',
        header: {
          'content-type': 'application/json'
        },
        method: 'GET',
        data: {
          openid: app.globalData.Openid
        },
        success(res) {
          if (res.data.status) {
            wx.showModal({
              title: '确认再次换套?',
              content: '再次换套将收取费用',
              success(res) {
                if (res.confirm) {
                  that.Huanquan()
                  setTimeout(function () {
                    wx.onBLECharacteristicValueChange(function (res) {
                      var info = that.ab2hex(res.value)
                      console.log(info)
                      that.NotifyChange(info)
                    })
                  }, 2000)
                  setTimeout(function () {
                    wx.hideLoading()
                    wx.onBLECharacteristicValueChange(function (res) {
                      var info = that.ab2hex(res.value)
                      console.log(info)
                      that.JudgeError(info)
                    })
                  }, 16000)
                }
                if (res.cancel){
                  PayStatus = true;
                  time=0;
                }
              }
            })
          } else {
            wx.showModal({
              title: '提示',
              content: '检测上次费用尚未支付',
              confirmText: '去支付',
              success(res) {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '../consume/consume',
                  })
                }
                if (res.cancel){
                  PayStatus = true
                  time = 0
                }
              }
            })
          }
        }
      })
    }
  },

  YedengSwicth: function() {
    var that = this;
    if (!that.data.BLECanUse) {
      wx.showToast({
        title: '设备故障',
        icon: 'none'
      })
    } else {
      time = 0;
      var content = that.RenturnData(that.data.YedengData, that.data.Temperature);
      const buffer = that.generate_buffer(content);
      console.log("写入夜灯数据" + that.data.YedengData);
      that.WriteData(buffer);
      if (that.data.YedengCount % 2 === 1) {
        wx.showToast({
          title: '夜灯已开启',
        })
      } else {
        wx.showToast({
          title: '夜灯已关闭',
        })
        time=0;
      }
      that.data.YedengCount++;
    }
  },
  SendDataChuchou: function() {
    var that = this
    if (!that.data.BLECanUse) {
      wx.showToast({
        title: '设备故障',
        icon: 'none'
      })
    } else {
      time = 0
      var content = that.RenturnData(that.data.ChuchouData, that.data.Temperature);
      const buffer = that.generate_buffer(content);
      console.log("写入除臭数据" + that.data.ChuchouData)
      that.WriteData(buffer);
      if (that.data.ChuchouCount % 2 === 1) {
        wx.showToast({
          title: '除臭已开启',
        })
      } else {
        wx.showToast({
          title: '除臭已关闭',
        })
        time=0;
      }
      that.data.ChuchouCount++;
    }
  },
  HandleChange: function(e) {
    var that = this;
    that.setData({
      Value: e.detail.value
    })
  },
  WenduAdjust: function(e) {
    var that = this;
    that.setData({
      Wendu: e.detail.value
    })
  },
  generate_buffer: function(a) {
    const buffer = new ArrayBuffer(a.length);
    const dataView = new DataView(buffer);
    var i = 0;
    for (var item of a) {
      dataView.setUint8(i, item);
      i++;
    }
    return buffer;
  },
  WriteData: function(buffer) {
    var that = this;
    wx.writeBLECharacteristicValue({
      deviceId: that.data.ConnectedDeviceId,
      serviceId: that.data.UUIDWriteServices,
      characteristicId: that.data.UUIDWriteCharacteristic,
      value: buffer,
      success: function(res) {
        console.log("写入数据成功");
      },
      fail() {
        console.log("写入数据失败");
      }
    })
  },
})