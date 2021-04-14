const { app, BrowserWindow, ipcMain } = require('electron');
const path = require("path");

const fs = require('fs');

let appWindow = null;

function createWindow() {
    appWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
        resizable: false,
        // frame: false,
        icon: path.join(__dirname, 'src/favicon.ico')
    });
    appWindow.loadFile(path.join(__dirname, `index.html`));
    appWindow.webContents.openDevTools();
}

app.whenReady()
    .then(createWindow) // passing the function as a callback, not the return of the function
    .then(setupApp());

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', function () {
    if (win === null) {
        initWindow();
    }
})

ipcMain.on('saveFile', async (event, data) => {
    console.log('saving file...');
    try {
        fs.writeFile(path.join(__dirname, '../xls2xml-output/', data.filename + '.txt'), data.data, (err) => {
            if (err) {
                console.log('error: ', err);
            } else {
                console.log('test-file.txt saved!');
            }
        });
    } catch(err) {
        console.log('error: ', err);
    }
})

function setupApp() {
    try {
        fs.mkdir(path.join(__dirname, '../xls2xml-output'), (err) => {
            if (err) {
                if (err.code === 'EEXIST') {
                    console.log('output folder already exists');
                } else {
                    console.log('error: ', err);
                }
            } else {
                console.log('output folder created');
            }
        });
    } catch(err) {
        console.log('error: ', err);
    }
}