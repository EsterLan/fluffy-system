module.exports = (ctx) => {
  const { BrowserWindow, ipcMain, mainWindow } = ctx;

  let win;

  let init = () => {
    if (win === null || win === undefined) {
      createWindow();
    }
  };

  let createWindow = () => {
    win = new BrowserWindow({
      frame: false,
      autoHideMenuBar: true,
      width: 350,
      height: 200,
      alwaysOnTop: true,
      useContentSize: true,
      maximizable: false,
      minimizable: false,
      transparent: true,
      show: false,
      backgroundColor: '#00000000',
      webPreferences: {
        contextIsolation: false,
        webviewTag: true,
        webSecurity: false,
        enableRemoteModule: true,
        backgroundThrottling: false,
        nodeIntegration: true,
      },
    });
    win.webContents.openDevTools({ mode: "detach" })
    win.loadURL(`file://${__dirname}/todoPannel/main.html`);
    // 打包后，失焦隐藏
    // win.on("blur", () => {
    //   win.hide();
    // });
  };

  let getWindow = () => win;

  return {
    init,
    getWindow,
  };
};
