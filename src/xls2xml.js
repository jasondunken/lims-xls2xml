let statusMessage = "";

let inputData;
let outputData;

function onFileChange() {
  const filePicker = document.getElementById('file-upload');
  if (filePicker.files.length > 0) { 
    if (filePicker.files.length > 1) {
      console.log('XLSX can only load one file at a time');
      return;
    }
    window.api.send('loadFile', filePicker.files[0].path);
  } 
}

function saveXML() {
  // TODO validate name
  outputData.filename = document.getElementById('output-file-name').value;
  outputData.extension = '.xml';
  window.api.send("saveFile", outputData);
}

window.api.receive("inputData", (data) => {
  inputData = data;
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

window.api.receive("outputData", (data) => {
  outputData = data;
  document.getElementById('output-file-name').value = data.filename;
  document.getElementById('output-file').textContent = data.xmlOutput;
})