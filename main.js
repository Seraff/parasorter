const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron')
const menu = require('./js/menu.js')
const path = require('path')
const fs = require('fs')

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true

function createWindow () {
  let win = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false,
      contextIsolation: true,
    }
  })

  win.once('ready-to-show', () => {
    win.show()
    win.webContents.openDevTools()
  })

  menu.build_menu()

  win.loadFile('index.html')

  return win
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  app.quit()
})


// Events

ipcMain.handle('parasorter:open_tree_file_dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(options)

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  return result.filePaths[0]
})

ipcMain.handle('parasorter:open_file', async (event, path) => {
  fs.readFile(path, 'utf8', (err, data) => {
    return data
  })

})

ipcMain.handle('parasorter:open_tsv_file_dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(options)

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  return result.filePaths[0]
})
