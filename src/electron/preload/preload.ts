// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'
import { ButtonConfig } from "../models/buttonConfig"

contextBridge.exposeInMainWorld('electronAPI', {
  readConfig: (btnNr: string) => ipcRenderer.invoke('config:read', btnNr),
  writeConfig: (config: ButtonConfig) => ipcRenderer.invoke('config:write', config),
  readIconFile: (path: string) => ipcRenderer.invoke('icon:read', path),
  selectPath: (title: string, extensions: string[]) => ipcRenderer.invoke('dialog:selectPath', {title, extensions}),
  on: (channel: string, func: (event: IpcRendererEvent, args: any[]) => void) => {
    let validChannels = ["button:press"] // <-- Array of all ipcMain Channels used in the electron
    if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args: any[]) => func(event, args))
    }
  }
})