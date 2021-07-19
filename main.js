const { app, BrowserWindow } = require('electron')
const path = require('path')
const { LOCAL_PROXY_EVENT } = require('./src/const/index')


app.commandLine.appendSwitch('proxy-server', 'socks://127.0.0.1:1080')

let mainWindow
function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1280, 
    height: 720,
    resizable: false,
    webPreferences: {
      webviewTag: true,
      nodeIntegration: true
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

// let command = 'youtube-dl --proxy socks5://127.0.0.1:1080 -f 137 https://www.youtube.com/watch\?v=ekP7VLeXnqY'
// let cmdStr = './'