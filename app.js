const { app, BrowserWindow, ipcMain } = require("electron");

const path = require("path");

const fileConverter = require("./src/fileConverter");
const fileOutput = require("./src/fileOutput");

if (require("electron-squirrel-startup")) return app.quit();

let appWindow = null;

function createWindow() {
    appWindow = new BrowserWindow({
        width: 720,
        height: 480,
        minWidth: 720,
        minHeight: 480,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "preload.js"),
        },
        icon: path.join(__dirname, "src/favicon.ico"),
    });
    appWindow.loadFile(path.join(__dirname, "src/index.html"));
    appWindow.webContents.openDevTools();
    appWindow.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", function () {
    if (win === null) {
        initWindow();
    }
});

ipcMain.on("loadFile", async (event, path) => {
    fileConverter.loadFile(appWindow, path);
});

ipcMain.on("translateXLS", async (event, data) => {
    fileConverter.translateXLS(appWindow, data);
});

ipcMain.on("saveFile", async (event, data) => {
    fileOutput.saveFile(appWindow, data);
});
