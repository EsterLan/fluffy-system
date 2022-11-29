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
    notifyList: []
  },
  created() {
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
          const currentTamp = parseInt(new Date().getTime() / 1000)
          // 过滤提醒时间还没到的
          this.notifyList = this.notifyList.filter((item => {
            let notifyTamp = parseInt(new Date(item.notifyTime).getTime() / 1000 )
            // 给1s的代码执行误差范围
            console.log("时间戳差值：", notifyTamp - currentTamp)
            return notifyTamp - currentTamp < 1
          }))
          console.log("第二次过滤后--", this.notifyList)
          let has = false
          // 当前是否有需要提醒的
          this.notifyList.some(item => {
              let notifyTamp = parseInt(new Date(item.notifyTime).getTime() / 1000 )
              // 10:避免check-notofy10秒的定时漏掉
              has = notifyTamp - currentTamp > -10 && notifyTamp - currentTamp < 1
              return has
          })
          console.log("是否需要弹窗：", has)
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
    }
  },

  watch: {
    
  }
})
