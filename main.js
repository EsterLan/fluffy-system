const todoPanel = require("./todo-window");

module.exports = () => {
  return {
    async onReady(ctx) {
      console.log("初始话系统插件")
      const { screen, ipcMain } = ctx;
      // 初始化提醒面板 window
      const panelInstance = todoPanel(ctx);
      panelInstance.init();
      let win = panelInstance.getWindow();
      const screenSize = screen.getPrimaryDisplay().workAreaSize;
      win.setBounds({
        x: parseInt(screenSize.width-360), 
        y: parseInt(screenSize.height-210)
      });
      // win.setVisibleOnAllWorkspaces(true, {visibleOnFullScreen: true});
      // win.focus();
      // win.setVisibleOnAllWorkspaces(true, {visibleOnFullScreen: true});
      // win.setAlwaysOnTop(true);
      // win.show();
      
      
      // 实时更新
      ipcMain.on("refresh-notify", async () => {
        const notifyList = await global.TODO_NOTIFIES.getNotifies() || [];
        win.webContents.send('check-notofy', JSON.stringify(notifyList));
      })

      ipcMain.on("hide-win", () => {
        win.hide()
      })

      ipcMain.on("get-local-plugins", () => {
        const localPlugins = global.LOCAL_PLUGINS.getLocalPlugins() || []
        win.webContents.send("local-plugins", JSON.stringify(localPlugins))
      })

      ipcMain.on("show-win", () => {
        win.setVisibleOnAllWorkspaces(true, {visibleOnFullScreen: true});
        win.setAlwaysOnTop(true, "normal");
        win.show()
      })

      const timer = setInterval(async () => {
        const notifyList = await global.TODO_NOTIFIES.getNotifies() || [];
        win.webContents.send('check-notofy', JSON.stringify(notifyList));
      }, 10 * 1000)

      win.on("closed", () => {
        win = undefined;
        timer = null
      });
    },
  }
}
