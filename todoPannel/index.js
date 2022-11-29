const {ipcRenderer, remote, clipboard, nativeImage} = require('electron')
const path = require('path');

window.openPlugin = ({plugin, feature, data}) => {
//  console.log(data, '-----');
  ipcRenderer.send('msg-trigger', {
    type: 'openPlugin',
    data:{
      ...plugin,
      cmd: feature.cmds[0],
      ext: {
        code: feature.code,
        type:  "text",
        payload: data,
      },
    },
  })
}

new Vue({
  el: '#app',
  data: {
    notifyList: [],
    localPlugins: [],
    selectedItem: {}
  },
  created() {
    // 打开插件
    ipcRenderer.on('local-plugins', (e, args) => {
      if (args) {
        this.localPlugins = JSON.parse(args || '')
        if (this.localPlugins && this.localPlugins.length > 0){
          this.localPlugins.forEach(plugin => {
            if (plugin.pluginName === "待办事项") {
              ipcRenderer.send("msg-trigger", {
                type: "openPlugin",
                data: {
                  ...plugin,
                  cmd: plugin.features[0].cmds[0],
                  ext: {
                    code: plugin.features[0].code,
                    type: "text",
                    payload: this.selectedItem.classId
                  }
                }
              })
            }
          })
        } 
      }
    });
    // 判断是否有需要notify提醒的内容
    ipcRenderer.on('check-notofy', (e, args) => {
      this.notifyList = []
      if (args) {
        const theData = JSON.parse(args || "").data || {}
        // 非空对象class
        if (Object.keys(theData).length !== 0 ) {
          for(let classKey in theData) {
            // work对象
            let workData = theData[classKey] || {}
            let workList = workData["workList"] || {}
            if (workList && Object.keys(workList).length !== 0) {
              for(let workKey in workList) {
                let workObj = workList[workKey]
                // 有提醒时间并且未完成
                if (workObj.notifyTime && !workObj.done ) {
                  workObj.classTitle = workData["content"]
                  workObj.classId = workData["id"]
                  this.notifyList.push(workObj)
                }
              }
            }
          }
        }

        // // 有消息提醒时间并且未完成
        // this.notifyList = (theData.data || []).filter(item => {
        //   return item.notifyTime && !item.done
        // })
        // console.log("第一次过滤后--", this.notifyList)
        if (this.notifyList && this.notifyList.length > 0) {
          //当前时间戳 -转成秒
          // const currentTamp = parseInt(new Date().getTime() / 1000)
          const currentTamp = this.getCurrentStamp()
          // 过滤提醒时间还没到的
          this.notifyList = this.notifyList.filter((item => {
            let notifyTamp = parseInt(new Date(item.notifyTime).getTime() / 1000 )
            // 给1s的代码执行误差范围
            console.log("传过来时间戳：",notifyTamp + "时间戳差值：", notifyTamp - currentTamp, "当前时间戳：", currentTamp)
            if(notifyTamp - currentTamp < 0) {
              this.$set(item, "overdue", true)
            } else {
              this.$set(item, "overdue", false)
            }
            return notifyTamp - currentTamp < 1
          }))
          this.notifyList.sort(this.sortByNotifyTime)
          let has = false
          // 当前是否有需要提醒的
          this.notifyList.some(item => {
              let notifyTamp = parseInt(new Date(item.notifyTime).getTime() / 1000 )
              // 10:避免check-notofy10秒的定时漏掉
              has = notifyTamp - currentTamp > -10 && notifyTamp - currentTamp < 1
              return has
          })
          // 弹窗提醒
          if (has) {
            ipcRenderer.send("show-win")
          }
        }
      }
    });
  },
  methods: {
    hideWin(){
      ipcRenderer.send("hide-win")
    },
    // 排序
    sortByNotifyTime(a, b) {
      const aTimeStamp = parseInt(new Date(a.notifyTime).getTime() / 1000);
      const bTimeStamp = parseInt(new Date(b.notifyTime).getTime() / 1000);
      return aTimeStamp > bTimeStamp ? -1 : 1
    },
    // 获取当前年月日 时分时间戳
    getCurrentStamp() {
      const myDate = new Date()
      const year = myDate.getFullYear();
      const mon = myDate.getMonth() + 1;
      const date = myDate.getDate();
      const hours = myDate.getHours();
      const min = myDate.getMinutes();
      const currentDate = year + "-" + mon + "-" + date + " " + hours + ":" + min
      const currentStamp = parseInt(new Date(currentDate).getTime()) / 1000
      return currentStamp
    },
    openPlugin(item) {
      this.selectedItem = item;
      ipcRenderer.send("get-local-plugins")
    }
  },

  watch: {
    
  }
})
