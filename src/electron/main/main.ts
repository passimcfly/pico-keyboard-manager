import { join } from 'path';
import {
    app,
    BrowserWindow,
    ipcMain,
    dialog,
    Tray,
    Menu,
    powerMonitor,
    globalShortcut
} from 'electron';
import {usb} from "usb"

import { Serial } from '../com/connection';

const iconLocation = join(__dirname, '../../images/appIcon.png')
const trayIconLocation = join(__dirname, '../../images/trayIcon.png')

let mainWindow: BrowserWindow | null = null;
let mainWindowState: "hidden" | "visible" = "visible"

let tray: Tray | null = null

let forceClose: boolean = false

const isDev = process.env.npm_lifecycle_event === "app:dev" ? true : false;

async function handleFileOpen() {
    const { canceled, filePaths } = await dialog.showOpenDialog({ title: "Open File" })
    if (!canceled) {
        return filePaths[0]
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1300,
        height: 1000,
        resizable: false,
        webPreferences: {
            preload: join(__dirname, '../preload/preload.js'),
        },
        autoHideMenuBar: true,
        icon: iconLocation,
        paintWhenInitiallyHidden: false,
        title: "Pico Keyboard Manager",
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools(); // Open the DevTools.
    } else {
        mainWindow.loadFile(join(__dirname, '../../index.html'));
    }
}

function regTray() {
    tray = new Tray(trayIconLocation)
    let contextMenu = buildTrayMenu()
    tray.setToolTip('Pico Keyboard Manager')
    tray.setContextMenu(contextMenu)
  }

function buildTrayMenu() {
    return Menu.buildFromTemplate([
        { 
          id: "quit", 
          label: 'Exit', 
          type: 'normal',
          click: () => {
            closeApp()
          } 
        },
        { 
          id: "manager",
          label: "Manager",
          type: 'normal',
          click: windowToggler
        }
      ])
}

function windowToggler() {
    if(mainWindow && mainWindowState === "visible") {
        mainWindow!.hide()
        mainWindowState = "hidden"
        globalShortcut.unregister('CommandOrControl+R');
        globalShortcut.unregister('F5');
    } else {
      if(!mainWindow) {
          createWindow()
      } else {
          mainWindow.show()
          mainWindowState = "visible"
      }
    }
}

function closeApp() {
    forceClose = true
    mainWindow?.close()
    tray?.closeContextMenu()
    tray = null

    app.quit()
}

function serialEvents(serial: Serial) {
    serial.connection.on("open", () => {
        console.log("open")
        serial.connection.on("readable", () => {
            const data = Serial.regReadEvent(serial)
            if(mainWindow && data){
                mainWindow.webContents.send("button:press", {keys: JSON.parse(data)})
            }
        });
        serial.connection.on("close", ()=>{
            closeApp()
        })
        serial.connection.on("error", (error)=>{
            closeApp()
        })
    })
}

app.whenReady().then(async () => {
    ipcMain.handle('dialog:openFile', handleFileOpen)
    const serial = await Serial.getInstance()
    serialEvents(serial)
    createWindow()
    regTray()
});

app.on("before-quit", (event) => {
    if(!forceClose) {
        event.preventDefault()
        mainWindow = null
    }
});

app.on('browser-window-focus', function () {
    globalShortcut.register("CommandOrControl+R", () => {console.log("CommandOrControl+R")});
    globalShortcut.register("F5", () => {console.log("F5")});
});

app.on('browser-window-blur', function () {
    globalShortcut.unregister('CommandOrControl+R');
    globalShortcut.unregister('F5');
});

powerMonitor.on('shutdown', () => {
    closeApp();
});