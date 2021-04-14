let  statusMessage = "";

let  inputFile = '';
let  inputName = '';
let  colNames = [];
let  colData = [];
let  outputFile = '';
let  outputName = 'default-test-file';

function onFileChange() {
  if (document.getElementById('file-upload').files.length > 1) {
    console.log('XLSX can only load one file at a time');
    return;
  }
  this.loadFile(document.getElementById('file-upload').files[0].path);
}

function loadFile(path) {
  window.api.send('loadFile', path);
}

function saveXML() {
  window.api.send("saveFile", { filename: 'test-file', data: 'some data' });
}

window.api.receive("fileData", (data) => {
  document.getElementById('input-file-name').innerHTML = data.path;

  let tableHTML = '<table><thead><tr>';
  for (let i = 0; i < data.colNames.length; i++) {
    tableHTML += `<th>${data.colNames[i]}</th>`;
  }
  tableHTML += '</tr></thead>';
  for (let i = 0; i < data.colData.length; i++) {
    tableHTML += '<tr>';
    for (let j = 0; j < data.colNames.length; j++) {
      tableHTML += `<td>${data.colData[i][j]}</td>`;
    }
    tableHTML += '</tr>';
  }
  tableHTML += "</table>";
  document.getElementById('input-file').innerHTML = tableHTML;
})
