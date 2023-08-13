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
    globalShortcut,
    IpcMainInvokeEvent
} from 'electron';

import { Serial } from '../com/connection';
import { ButtonConfig } from "../models/buttonConfig"

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
    if(!exists){
        if(type === "dir"){
            fs.mkdirSync(path)
        } else {
            fs.writeFileSync(path, Buffer.from(""))
        }
    }
    return true
}

async function selectPath(_event: IpcMainInvokeEvent, args: {title:string, extensions: string[]}) {
    const { canceled, filePaths } = await dialog.showOpenDialog({ title: args.title, filters: [{name: "", extensions: args.extensions }] })
    if (!canceled) {
        return filePaths[0]
    }
    return null
}

function readButtonConfigs(): ButtonConfig[] {
    const configBuffer = fs.readFileSync(`${pathToConfig}\\buttonConfig.json`)
    let config: ButtonConfig[] = []
    try {
        config = JSON.parse(configBuffer.toString())
    } catch (error) {
        const clearButtons: ButtonConfig[] = []
        for (let index = 0; index < 12; index++) {
            clearButtons.push({
                btn: index,
                iconPath: "",
                color: "",
                programmPath: ""
            })
        }
        config = clearButtons
    }

    return config
}

function readButtonConfig(_event: IpcMainInvokeEvent, btnNr: number): ButtonConfig {
    let config: ButtonConfig[] = readButtonConfigs()
    
    let btn = config.find((button) => {return button.btn === btnNr})
    if(!btn) {
        btn = {
            btn: btnNr,
            iconPath: "",
            color: "",
            programmPath: ""
        }
    }
    return btn
}

function readIconPathIntoBuffer(_event: IpcMainInvokeEvent, path: string): string | null {
    try {
        const base64 = fs.readFileSync(path).toString("base64")
        const type = path.split(".")[1]
        return `data:image/${type};base64,${base64}`
    } catch (error) {
        return null
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
    if(!file) {
        fs.writeFileSync(`${pathToConfig}\\buttonConfig.json`, Buffer.from(JSON.stringify(buttons)))
    }
}

function UpdateButtonConfig(_event: IpcMainInvokeEvent, config: ButtonConfig): ButtonConfig  {
    const file = checkIfPathExistsElseCreate(`${pathToConfig}\\buttonConfig.json`, "file")
    const configs = readButtonConfigs()
    if(file) {
        const index = configs.findIndex((btn) => {return btn.btn === config.btn})
        configs[index] = config
        fs.writeFileSync(`${pathToConfig}\\buttonConfig.json`, Buffer.from(JSON.stringify(configs)))
    }
    return config
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
    let strSendKeys: string = ""
    serial.connection.on("open", () => {
        serial.connection.on("readable", () => {
            const strData = Serial.regReadEvent(serial)
            if(mainWindow && strData && !(strSendKeys === strData)){
                strSendKeys = strData
                mainWindow.webContents.send("button:press", {keys: JSON.parse(strData)})
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

function regIpcMainEvents() {
    ipcMain.handle('dialog:selectPath', selectPath)
    ipcMain.handle('icon:read', readIconPathIntoBuffer)
    ipcMain.handle('config:read', readButtonConfig)
    ipcMain.handle('config:write', UpdateButtonConfig)
}

function setupConfig() {
    checkIfPathExistsElseCreate(pathToConfig, "dir")
    CreateButtonsConfig()
}

app.whenReady().then(async () => {
    const serial = await Serial.getInstance()

    setupConfig()
    regIpcMainEvents()
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
    globalShortcut.register("CommandOrControl+R", () => {});
    globalShortcut.register("F5", () => {});
});

app.on('browser-window-blur', function () {
    globalShortcut.unregister('CommandOrControl+R');
    globalShortcut.unregister('F5');
});

powerMonitor.on('shutdown', () => {
    closeApp();
});