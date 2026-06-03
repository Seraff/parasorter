const { app, BrowserWindow, shell, ipcMain } = require('electron')
const path = require('path')

let aboutWindow = null

function showAbout(parent) {
    if (aboutWindow) { aboutWindow.focus(); return }

    parent = parent || BrowserWindow.getFocusedWindow()  // fallback

    aboutWindow = new BrowserWindow({
        width: 420,
        height: 420,
        resizable: false,
        minimizable: false,
        maximizable: false,
        title: 'About Parasorter',
        parent: parent,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, '../about-preload.js')
        }
    })

    aboutWindow.loadFile(path.join(__dirname, '../about.html'))
    aboutWindow.setMenuBarVisibility(false)
    aboutWindow.once('ready-to-show', () => aboutWindow.show())
    aboutWindow.on('closed', () => { aboutWindow = null })

    // any link with target=_blank opens in the default browser
    aboutWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url)
        return { action: 'deny' }
    })
}

const pkg = require(path.join(app.getAppPath(), 'package.json'))

ipcMain.handle('about:info', () => ({
    name: app.getName(),            // see note below
    version: app.getVersion(),
    description: pkg.description,
    author: typeof pkg.author === 'string'
        ? pkg.author
        : pkg.author?.name ?? '',     // npm author can be a string OR {name,email,url}
    year: new Date().getFullYear()
}))

module.exports = { showAbout }
