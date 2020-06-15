var electron = require("electron")
var app = electron.app
var Menu = electron.Menu

const template = [
  {
    label: 'File',
    submenu: [
      {
        id: "open-tree",
        label: "Open Tree",
        accelerator: "CmdOrCtrl+O"
      },
      {
        id: "apply-tsv",
        label: "Apply tsv",
        accelerator: "CmdOrCtrl+Shift+O"
      },
      {
        id: "save-tsv",
        label: "Save tsv",
        accelerator: "CmdOrCtrl+S"
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {
        id: "find",
        label: 'Find',
        accelerator: 'CmdOrCtrl+F'
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
  {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: function() { shell.openExternal('http://electron.atom.io') }
      },
    ]
  },
];

if (process.platform === 'darwin') {
  template.unshift({
    label: "Noodler",
    submenu: [
      {
        label: 'About Noodler',
        role: 'about'
      },
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
        label: 'Hide Noodler',
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
        accelerator: 'Command+Q'
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

  menu.setCallbackOnItem = function(item_id, callback){
    var item = menu.getMenuItemById(item_id);
    item.click = callback;
  }

  Menu.setApplicationMenu(menu);
}

module.exports = { build_menu: build_menu };
