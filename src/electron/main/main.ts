import { join } from 'path';
import * as fs from "node:fs"
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

import { Serial } from '../com/connection';
import { ButtonConfig } from "../../models/buttonConfig"

const iconLocation = join(__dirname, '../../images/appIcon.png')
const trayIconLocation = join(__dirname, '../../images/trayIcon.png')

const pathToConfig = `${process.env.USERPROFILE}\\Documents\\PicoKeyboardManager`

let mainWindow: BrowserWindow | null = null;
let mainWindowState: "hidden" | "visible" = "visible"

let tray: Tray | null = null

let forceClose: boolean = false

const isDev = process.env.npm_lifecycle_event === "app:dev" ? true : false;


function checkIfPathExistsElseCreate(path:string, type: "dir" | "file"): boolean {
    const exists = fs.existsSync(path)
    console.log("exists: " +  exists, path)
    if(!exists){
        if(type === "dir"){
            fs.mkdirSync(path)
        } else {
            fs.writeFileSync(path, Buffer.from(""))
        }
    }
    return true
}

async function selectIcon() {
    const { canceled, filePaths } = await dialog.showOpenDialog({ title: "Select Icon", filters: [{name: "", extensions: ["png","jpg","ico"] }] })
    if (!canceled) {
        return filePaths[0]
    }
}


function CreateButtonsConfig() {
    const buttons: ButtonConfig[] = []
    for (let index = 0; index < 12; index++) {
        buttons.push({
            btn: index,
            iconPath: "",
            color: "",
            programmPath: ""
        })
    
    }

    const file = checkIfPathExistsElseCreate(`${pathToConfig}\\buttonConfig.json`, "file")
    console.log(file)
    if(file) {
        fs.writeFileSync(`${pathToConfig}\\buttonConfig.json`, Buffer.from(JSON.stringify(buttons)))
    }
 }

function UpdateButtonsConfig() {
   const file = checkIfPathExistsElseCreate(`${pathToConfig}\\buttonConfig.json`, "file")
   if(file) {
        fs.writeFileSync(`${pathToConfig}\\buttonConfig.json`, Buffer.from(""))
   }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: isDev ? 1200 : 500,
        height: isDev? 1000 : 700,
        resizable: false,
        webPreferences: {
            preload: join(__dirname, '../preload/preload.js')
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
    checkIfPathExistsElseCreate(pathToConfig, "dir")
    // CreateButtonsConfig()
    ipcMain.handle('dialog:selectIcon', selectIcon)
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