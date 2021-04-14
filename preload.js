const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
    "api", {
        send: (channel, data) => {
            let validChannels = ["toMain", "saveFile"];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        receive: (channel, func) => {
            console.log('channel, func: ', channel, func);
            let validChannels = ["fromMain"];
            if (validChannels.includes(channel)) {
                ipcRenderer.on(channel, (event, ...args) => {
                    func(...args);
                })
            }
        }
    }
)