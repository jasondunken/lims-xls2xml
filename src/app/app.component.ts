import { Component } from '@angular/core';

import * as XLSX from "xlsx";

import { toXML } from 'jstoxml';
import { ElectronService } from './services/electron.service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'lims-xls-to-xml';

  time;

  statusMessage = "";

  inputFile = '';
  inputName = '';
  colNames = [];
  colData = [];
  outputFile = '';

  constructor(
    private electron: ElectronService
  ) {
    this.time = toXML({ currentTime: new Date() });
  };

  onFileChange($event: any) {
    const target: DataTransfer = <DataTransfer>($event.target);
    if (target.files.length !== 1) {
      console.log('XLSX can only load one file at a time');
      return;
    }
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, {type: 'binary'});
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      this.inputName = target.files[0].name;
      this.translateXLS(XLSX.utils.sheet_to_json(ws, {header: 1}));
    }
    reader.onerror = (err) => {
      this.statusMessage = 'Problem loading file';
      console.log('FileReader.error: ', err);
      reader.abort();
    }
    reader.readAsBinaryString(target.files[0]);
  }

  translateXLS(xls: any): void {
    this.inputFile = {...xls};
    console.log('input: ', this.inputFile);
    this.colNames = xls[0];
    this.colData = xls.splice(1);

    this.outputFile = toXML(this.inputFile);
    console.log('output: ', this.outputFile);
  }

  saveXML(): void {
    console.log("SAVE! ", this.getTimestampName());
    // this.electron.saveFile('testfilefromangular.txt', 'test text for angular test file');
  }

  getTimestampName(): string {
    const dateObj = new Date();
    const date = dateObj.toLocaleDateString().split("/");
    const time = dateObj.toLocaleTimeString();
    const name = this.inputName.slice(0, this.inputName.indexOf('.'));
    return [...date, ...time, name].join('_');
  }
}
