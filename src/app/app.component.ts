import { Component } from '@angular/core';

import * as XLSX from "xlsx";

import { toXML } from 'jstoxml';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'lims-xls-to-xml';

  statusMessage = "";
  xlsArray = [];
  xmlArray: any;

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

      this.xlsArray = XLSX.utils.sheet_to_json(ws, {header: 1});
      console.log("xls: ", this.xlsArray);
      this.xmlArray = toXML(this.xlsArray);
      console.log('xml: ', this.xmlArray);
    }
    reader.onerror = (err) => {
      this.statusMessage = 'Problem loading file';
      console.log('FileReader.error: ', err);
      reader.abort();
    }
    reader.readAsBinaryString(target.files[0]);
  }
}
