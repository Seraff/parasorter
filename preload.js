const {
    app,
    contextBridge,
    ipcRenderer
} = require("electron")

contextBridge.exposeInMainWorld("api", {
    openTreeFileDialog: (options) => ipcRenderer.invoke('parasorter:open_tree_file_dialog', options),
    openFile: (options) => ipcRenderer.invoke('parasorter:open_file', options),
    openTsvFileDialog: (options) => ipcRenderer.invoke('parasorter:open_tsv_file_dialog', options),
});

contextBridge.exposeInMainWorld("modules", {
    fs: require('fs'),
});

contextBridge.exposeInMainWorld('menuApi', {
    onOpenTree: (cb) => ipcRenderer.on('menu:open-tree', () => cb()),
    onImportTsv: (cb) => ipcRenderer.on('menu:import-tsv', () => cb()),
    onSaveTsv: (cb) => ipcRenderer.on('menu:save-tsv', () => cb()),
});
