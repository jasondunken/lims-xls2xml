const { app, BrowserWindow, ipcMain } = require('electron');
const path = require("path");

const fs = require('fs');

let appWindow;

// if (require('electron-squirrel-startup')) return app.quit();

function createWindow() {
    appWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true
        },
        resizable: false,
        frame: false,
        icon: path.join(__dirname, 'src/favicon.ico')
    });
    appWindow.loadFile(path.join(__dirname, `dist/index.html`));
    appWindow.webContents.openDevTools();
}

app.whenReady()
    .then(createWindow)
    .then(setupApp())
    .then(testSave());

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

ipcMain.handle('saveFile', async (event, fileName, fileData) => {
    console.log('saving file...');
    try {
        fs.writeFile(path.join(__dirname, '../xls2xml-output/', fileName), fileData, (err) => {
            if (err) {
                console.log('error: ', err);
            } else {
                console.log('testFile.txt saved!');
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

function testSave() {
    try {
        fs.writeFile(path.join(__dirname, '../xls2xml-output/testFile.txt'), 'test file test text', (err) => {
            if (err) {
                console.log('error: ', err);
            } else {
                console.log('testFile.txt saved!');
            }
        });
    } catch(err) {
        console.log('error: ', err);
    }
}