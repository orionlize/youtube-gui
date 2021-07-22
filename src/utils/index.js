const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const { LOCAL_READ, LOCAL_WRITE, DOWNLOAD } = require('../const/index')

function _exec (command, commandPath, stdout, stderr) {
  let workerProcess 
  function runCommand(command, commandPath) {
    workerProcess = exec(command, commandPath)
    workerProcess.stdout.on('data', function (data) {
      stdout(data, workerProcess.pid)
    })
    workerProcess.stderr.on('data', function (data) {
      stderr()
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
    
    _exec(msg.shell, '~', function (data, pid) {
      e.sender.send(DOWNLOAD, data, msg.taskId, pid)
    }, function () {

    })
  },
  handlePause: function (e, msg) {
    _exec(`kill -9 ${msg}`)
  }
}