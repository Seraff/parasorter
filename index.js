const { app, BrowserWindow } = require('electron')
const menu = require('./js/menu.js')

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })

  menu.build_menu()
  win.loadFile('index.html')
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  app.quit()
})
