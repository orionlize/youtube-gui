const { app, BrowserWindow } = require('electron')
const path = require('path')
const { LOCAL_PROXY_EVENT } = require('./src/const/index')


app.commandLine.appendSwitch('proxy-server', 'http://127.0.0.1:4780')

let mainWindow
function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1280, 
    height: 720,
    webPreferences: {
      webviewTag: true,
      nodeIntegration: true,
      webSecurity: false,
      preload: path.resolve(__dirname, '..', 'public/renderer.js')
    }})

  mainWindow.loadURL('http://localhost:3000/')
  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function() {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

global.electron.ipcRenderer.on(LOCAL_PROXY_EVENT, (e) => {
  console.log(e)
})