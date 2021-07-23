const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const { kill } = require('process')
const { LOCAL_READ, LOCAL_WRITE, DOWNLOAD, FINISH } = require('../const/index')

function _exec (command, commandPath, stdout, finish) {
  let workerProcess 
  function runCommand(command, commandPath) {
    workerProcess = exec(command, commandPath)
    workerProcess.stdout.on('data', function (data) {
      stdout(data, workerProcess.pid)
    })
    workerProcess.stderr.on('data', function (data) {
      console.log('---------', data)
    })
    workerProcess.addListener('close', function(_, signal) {
      if (signal !== 'SIGKILL') {
        finish()
      }
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
    let timeout = null

    const ref = {fileName: '获取中', percentage: '0.0%', fileSize: '获取中', waitingTime: '00:00'}
    let fileName = ''

    _exec(msg.shell, '~', function (data, pid) {
      new Promise((resolve, reject) => {
        const fileStart = data.indexOf('[download] Destination: ')
        const downloadStart = data.indexOf('[download]')
        const finish = data.search(/ in /)
    
        if (fileStart !== -1) {
          const fileEnd = data.search(/(\n|\r|(\r\n)|(\u0085)|(\u2028)|(\u2029))/)
          ref.fileName = data.substring(24, fileEnd)
          if (!fileName) {
            fileName = ref.fileName
          }
        } else if (downloadStart !== -1) {
          const percentageRegex = data.match(/\[download\] +([\s\S]*?) +of/)
          const fileSizeRegex = data.match(/of +([\s\S]*?) +at/)
          const speedRegex = data.match(/at +([\s\S]*?) +/)
      
          if (percentageRegex) {
            ref.percentage = percentageRegex[1]
          }
          if (fileSizeRegex) {
            ref.fileSize = fileSizeRegex[1]
          }
          ref.speed = speedRegex ? speedRegex[1] : '0KiB/s'
          ref.waitingTime = data.split(' ').pop() || '00:00'

          if (finish !== -1) {
            if (timeout) {
              clearTimeout(timeout)
              e.sender.send(DOWNLOAD, ref, msg.taskId, pid)
            }
          }
        }
  
        if (!timeout) {
          timeout = setTimeout(() => {
            e.sender.send(DOWNLOAD, ref, msg.taskId, pid)
          }, 1000)
          timeout = null
        }
        resolve(true)
      })
    }, function () {
      fileName = fileName.split('.')
      fileName.splice(fileName.length - 2, 1)
      fs.stat(path.resolve(__dirname, '..', '..', fileName.join('.')), function (err, stats) {
        e.sender.send(FINISH, msg.taskId, (stats.size / 1000000).toFixed(2) + 'MIB')
      })
    })
  },
  handlePause: function (e, msg) {
    try {
      kill(msg, 9)
      kill(msg + 1, 9)
    } catch (error) {
      console.log(error)
    }
  }
}