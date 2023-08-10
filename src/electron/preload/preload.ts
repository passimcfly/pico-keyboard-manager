// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  readConfig: () => {ipcRenderer.invoke('dialog:readConfig')},
  selectIcon: () => ipcRenderer.invoke('dialog:selectIcon'),
  on: (channel: string, func: (event: IpcRendererEvent, args: any[]) => void) => {
    let validChannels = ["button:press"] // <-- Array of all ipcMain Channels used in the electron
    if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args: any[]) => func(event, args))
    }
}
})