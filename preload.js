const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
    send: (channel, data) => {
        let validChannels = ["loadFile", "translateXLS", "saveFile", "error", "info"];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel, func) => {
        let validChannels = ["inputData", "outputData", "error", "info"];
        if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => {
                func(...args);
            });
        }
    },
});
