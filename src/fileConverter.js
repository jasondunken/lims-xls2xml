const XLSX = require('xlsx');
const toXML = require('to-xml').toXML;

function loadFile(window, path) {
    console.log("test function!");
    // TODO error checking
    const workbook = XLSX.readFile(path);
    const wsName = workbook.SheetNames[0];
    const wsData = XLSX.utils.sheet_to_json(workbook.Sheets[wsName], {header: 1});
    translateXLS(window, path, wsData);
}

function translateXLS(window, path, wsData) {
    const colNames = wsData[0];
    const colData = wsData.splice(1);
    window.webContents.send('inputData', { path, colNames, colData });
    
    path = path.split('\\');
    let filename = path[path.length - 1];
    filename = filename.slice(0, filename.indexOf('.'));
    window.webContents.send('outputData', { filename, colNames, colData });
}

module.exports = {
    loadFile
}