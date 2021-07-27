const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { LOCAL_READ, LOCAL_WRITE, DOWNLOAD, PAUSE, DELETE, READ_CONFIG } = require('./const/index')
const { handleReadMessage, handleWriteMessage, readConfigureSync, handleDownload, handlePause, handleDelete } = require('./utils/index')

const config = readConfigureSync()
const readConfig = function(e) {
  e.sender.send(READ_CONFIG, config)
}

app.commandLine.appendSwitch('proxy-server', `${config.proxy.type}${config.proxy.ip}`)


let mainWindow
function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1280, 
    height: 720,
    // resizable: false,
    webPreferences: {
      webviewTag: true,
      nodeIntegration: true,
      contextIsolation: false,
    }})

  ipcMain.on(LOCAL_READ, handleReadMessage)
  ipcMain.on(LOCAL_WRITE, handleWriteMessage)
  ipcMain.on(DOWNLOAD, handleDownload)
  ipcMain.on(PAUSE, handlePause)
  ipcMain.on(DELETE, handleDelete)
  ipcMain.on(READ_CONFIG, readConfig)

  mainWindow.loadURL('http://localhost:3000/')
  mainWindow.webContents.openDevTools()
  mainWindow.on('closed', function() {
    mainWindow = null
    ipcMain.off(LOCAL_READ, handleReadMessage)
    ipcMain.off(LOCAL_WRITE, handleWriteMessage)
    ipcMain.off(DOWNLOAD, handleDownload)
    ipcMain.off(PAUSE, handlePause)
    ipcMain.off(DELETE, handleDelete)
    ipcMain.off(READ_CONFIG, readConfig)
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