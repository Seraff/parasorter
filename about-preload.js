const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld('appInfo', {
    get: () => ipcRenderer.invoke('about:info')
})
