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

ipcMain.on('loadFile', async (event, path) => {
    const workbook = XLSX.readFile(path);
    const wsName = workbook.SheetNames[0];
    const wsData = XLSX.utils.sheet_to_json(workbook.Sheets[wsName], {header: 1});
    const colNames = wsData[0];
    const colData = wsData.splice(1);
    appWindow.webContents.send('fileData', { path, colNames, colData });
})

ipcMain.on('saveFile', async (event, data) => {
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

function translateXLS(xls) {
  this.inputFile = {...xls};
  // console.log('input: ', this.inputFile);
  this.colNames = xls[0];
  this.colData = xls.splice(1);

  this.outputFile = toXML(this.inputFile);
  // console.log('output: ', this.outputFile);
  this.outputName = this.getTimestampName();
}

function getTimestampName() {
  const dateObj = new Date();
  const date = dateObj.toLocaleDateString().split("/");
  const time = dateObj.toLocaleTimeString();
  const name = this.inputName.slice(0, this.inputName.indexOf('.')).split(' ');
  return [...name, ...date, time].join('_');
}