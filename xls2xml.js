let  statusMessage = "";

let  inputFile = '';
let  inputName = '';
let  colNames = [];
let  colData = [];
let  outputFile = '';
let  outputName = 'default-test-file';

function onFileChange() {
  console.log('upload!');
    // const target: DataTransfer = <DataTransfer>($event.target);
    // if (target.files.length > 1) {
    //   console.log('XLSX can only load one file at a time');
    //   return;
    // }
    // const reader: FileReader = new FileReader();
    // reader.onload = (e) => {
    //   const bstr: string = e.target.result;
    //   const wb: XLSX.WorkBook = XLSX.read(bstr, {type: 'binary'});
    //   const wsname: string = wb.SheetNames[0];
    //   const ws: XLSX.WorkSheet = wb.Sheets[wsname];

    //   this.inputName = target.files[0].name;
    //   this.translateXLS(XLSX.utils.sheet_to_json(ws, {header: 1}));
    // }
    // reader.onerror = (err) => {
    //   this.statusMessage = 'Problem loading file';
    //   console.log('FileReader.error: ', err);
    //   reader.abort();
    // }
    // reader.readAsBinaryString(target.files[0]);
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

function saveXML() {
  window.api.send("saveFile", { filename: 'test-file', data: 'some data' });
}

function getTimestampName() {
  const dateObj = new Date();
  const date = dateObj.toLocaleDateString().split("/");
  const time = dateObj.toLocaleTimeString();
  const name = this.inputName.slice(0, this.inputName.indexOf('.')).split(' ');
  return [...name, ...date, time].join('_');
}
