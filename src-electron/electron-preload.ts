import { contextBridge, ipcRenderer } from 'electron';
import { BrowserWindow, dialog } from '@electron/remote';
import fs from 'fs';
import path from 'path';

declare global {
  interface Window {
    windowControlApi: ElectronWindowInterface;
    electronFileApi : ElectronFileInterface;
  }
}

interface ElectronWindowInterface {
  minimize: () => void;
  toggleMaximize: () => void;
  close: () => void;
  setAspectRatio: (aspectRatio: number, extraSize?: Electron.Size | undefined) => void;
}

contextBridge.exposeInMainWorld('windowControlApi', {
  minimize() {
    BrowserWindow.getFocusedWindow()?.minimize();
  },

  toggleMaximize() {
    const win = BrowserWindow.getFocusedWindow();

    if (win?.isMaximized()) {
      win.unmaximize();
    } else {
      win?.maximize();
    }
  },

  close() {
    BrowserWindow.getFocusedWindow()?.close();
  },

  setAspectRatio(aspectRatio: number, extraSize?: Electron.Size | undefined) {
    BrowserWindow.getFocusedWindow()?.setAspectRatio(aspectRatio, extraSize);
  }
});

interface ElectronFileInterface {
  dialog : Electron.Dialog;
  readdirSync : (
    path: fs.PathLike, options?: {
    encoding: BufferEncoding | null;
    withFileTypes?: false | undefined;
    } | BufferEncoding | null | undefined
  ) => string[];
  extname(p: string): string;
}

contextBridge.exposeInMainWorld('electronFileApi', {
  dialog : dialog,
  readdirSync : fs.readdirSync,
  extname : path.extname,
});