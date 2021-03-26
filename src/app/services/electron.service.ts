import { Injectable } from '@angular/core';

import { ipcRenderer } from 'electron';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  ipcRenderer: typeof ipcRenderer | undefined;

  constructor() {
    if (this.isElectron()) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
    }
  }

  isElectron(): boolean {
    console.log('window: ', window);
    return !!(window && window.process && window.process.type);
  }
}
