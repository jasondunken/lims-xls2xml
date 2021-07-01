const { app, BrowserWindow, ipcMain } = require("electron");

const path = require("path");

const fileConverter = require("./src/fileConverter");
const fileOutput = require("./src/fileOutput");

if (require("electron-squirrel-startup")) return app.quit();

let appWindow = null;

function createWindow() {
  appWindow = new BrowserWindow({
    width: 900,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
    },
    resizable: false,
    // frame: false,
    icon: path.join(__dirname, "src/favicon.ico"),
  });
  appWindow.loadFile(path.join(__dirname, "src/index.html"));
  // appWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow); // passing the function as a callback, not the return of the function

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
