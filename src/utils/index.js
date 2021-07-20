const { app, BrowserWindow } = require('electron')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const { LOCAL_READ, LOCAL_WRITE } = require('../const/index')

function _exec (command, commandPath) {
  let workerProcess 
  function runCommand(command, commandPath) {
    workerProcess = exec(command, commandPath)
    workerProcess.stdout.on('data', function (data) {
      data = data.split(' ').filter(_ => _)
      console.log(data[1], data[3], data[5], data[7])
    })
    workerProcess.stderr.on('data', function (data) {
      console.log(data)
    })
    workerProcess.on('close', function (code) {
      console.log('end:', code)
    })
  }
  runCommand(command, commandPath)
}

module.exports = {
  exec: _exec,
	readConfigureSync: function () {
		const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'config.json'), 'utf-8'))
		return config
	},
	handleReadMessage: function (e, _) {
    fs.readFile(path.resolve(__dirname, '..', 'config.json'), 'utf-8', function(err, data) {
      if (!err) {
        e.sender.send(LOCAL_READ, JSON.parse(data))
      } else {
        // 处理异常
      }
    })
  },
  handleWriteMessage: function (e, msg) {
    fs.writeFile(path.resolve(__dirname, '..', 'config.json'), JSON.stringify(msg), function(err) {
			if (err) {
				// 处理异常
			}else{
        e.sender.send(LOCAL_WRITE)
      }
		})
  },
  handleDownload: function (e, msg) {
    _exec(msg, '~')
  }
}