const { app, remote, shell, BrowserWindow, Menu } = require("electron")
const { showAbout } = require('./about')

function sendToFocusedWindow(channel, payload) {
  const win = BrowserWindow.getFocusedWindow();
  if (win && !win.isDestroyed()) {
    win.webContents.send(channel, payload);
  }
}

help_menu = {
  label: 'Help',
  role: 'help',
  submenu: [
    {
      label: 'Online Documentation',
      click: function () { shell.openExternal('https://thebrownlab.github.io/phylofisher-pages/') }
    }
  ]
}

about_item = {
  label: 'About Parasorter',
  click: (menuItem, browserWindow) => showAbout(browserWindow)
}

if (process.platform !== 'darwin') {
  help_menu.submenu.unshift(about_item)
}

const template = [
  {
    label: 'File',
    submenu: [
      {
        id: "open-tree",
        label: "Open Tree",
        accelerator: "CmdOrCtrl+O",
        click: () => sendToFocusedWindow('menu:open-tree')
      },
      {
        id: "apply-tsv",
        label: "Import tsv",
        accelerator: "CmdOrCtrl+Shift+O",
        click: () => sendToFocusedWindow('menu:import-tsv')
      },
      {
        id: "save-tsv",
        label: "Save tsv",
        accelerator: "CmdOrCtrl+S",
        click: () => sendToFocusedWindow('menu:save-tsv')
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        id: "find",
        label: 'Find',
        accelerator: 'CmdOrCtrl+F',
        click: () => sendToFocusedWindow('menu:find')
      },
      {
        type: 'separator'
      },
      {
        label: "Cut",
        accelerator: "CmdOrCtrl+X",
        role: "cut"
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: "copy"
      },
      {
        label: "Paste",
        accelerator: "CmdOrCtrl+V",
        role: "paste"
      },
      {
        label: "Select All",
        role: 'selectAll',
        accelerator: "CmdOrCtrl+A"
      },
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+Alt+R',
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.reload();
        }
      },
      {
        label: 'Toggle Full Screen',
        accelerator: (function() {
          if (process.platform === 'darwin')
            return 'Ctrl+Command+F';
          else
            return 'F11';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: (function() {
          if (process.platform === 'darwin')
            return 'Alt+Command+I';
          else
            return 'Ctrl+Shift+I';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.toggleDevTools();
        }
      },
    ]
  },
  {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      }
    ]
  },
  help_menu
];


if (process.platform === 'darwin') {
  template.unshift({
    label: "Parasorter",
    submenu: [
      about_item,
      {
        type: 'separator'
      },
      {
        label: 'Services',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: 'Hide Parasorter',
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        role: 'hideothers'
      },
      {
        label: 'Show All',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {

        label: 'Quit',
        id: 'quit',
        accelerator: 'Command+Q',
        role: 'quit'
      },
    ]
  });
}

function build_menu() {
  const menu = Menu.buildFromTemplate(template);

  menu.disableItemById = function(id){
    var item = menu.getMenuItemById(id);
    item.enabled = false;
  }

  menu.enableItemById = function(id){
    var item = menu.getMenuItemById(id);
    item.enabled = true;
  }

  Menu.setApplicationMenu(menu);
}

module.exports = { build_menu: build_menu };
