const { app, BrowserWindow, ipcMain } = require('electron');
const path = require("path");

const fs = require('fs');

const XLSX = require('xlsx');
const toXML = require('to-xml').toXML;

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
    appWindow.loadFile(path.join(__dirname, 'index.html'));
    appWindow.webContents.openDevTools();
}

app.whenReady()
    .then(createWindow) // passing the function as a callback, not the return of the function
    .then(setupApp);

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

ipcMain.on('loadFile', async (event, path) => {
    // TODO error checking
    const workbook = XLSX.readFile(path);
    const wsName = workbook.SheetNames[0];
    const wsData = XLSX.utils.sheet_to_json(workbook.Sheets[wsName], {header: 1});
    translateXLS(path, wsData);
})

ipcMain.on('saveFile', async (event, data) => {
    const filename = `${data.filename}_${getTimestamp()}.xml`; 
    try {
        fs.writeFile(path.join(__dirname, '../xls2xml-output/', filename), JSON.stringify(data.colData), (err) => {
            if (err) {
                console.log('error: ', err);
            } else {
                console.log(`${data.filename} saved.`);
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

function translateXLS(path, wsData) {
    const colNames = wsData[0];
    const colData = wsData.splice(1);
    appWindow.webContents.send('inputData', { path, colNames, colData });
    
    path = path.split('\\');
    let filename = path[path.length - 1];
    filename = filename.slice(0, filename.indexOf('.'));
    appWindow.webContents.send('outputData', { filename, colNames, colData });
}

function getTimestamp() {
    const dateObj = new Date();
    const date = dateObj.toLocaleDateString().split("/");
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const seconds = dateObj.getSeconds();

    return `${[...date].join('-')}_${hours}-${minutes}-${seconds}`;
}