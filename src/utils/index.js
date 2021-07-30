const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const { kill } = require('process')
const { LOCAL_READ, LOCAL_WRITE, DOWNLOAD, FINISH } = require('../const/index')

function _exec (command, commandPath, newFunc, stdout, finish) {
  let workerProcess 
  function runCommand(command, commandPath) {
    workerProcess = exec(command, {cwd: commandPath})
    newFunc(workerProcess.pid)
    workerProcess.stdout.on('data', function (data) {
      console.log(data)
      stdout(data)
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

    const ref = {fileName: '获取中', percentage: '0.0%', fileSize: '获取中', waitingTime: '00:00', fileUrl: ''}
    let fileName = ''

    _exec(msg.shell, msg.downloadPath, function (pid) {
      ref.pid = pid
      e.sender.send(DOWNLOAD, ref, msg.taskId)
    }, function (data) {
      new Promise((resolve, reject) => {
        const fileStart = data.indexOf('[download] Destination: ')
        const downloadStart = data.indexOf('[download]')
        const finish = data.search(/ in /)
    
        if (fileStart !== -1) {
          const fileEnd = data.search(/(\n|\r|(\r\n)|(\u0085)|(\u2028)|(\u2029))/)
          ref.fileName = data.substring(24, fileEnd)
          ref.fileUrl = path.resolve(msg.downloadPath, ref.fileName + '.part')
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
              e.sender.send(DOWNLOAD, ref, msg.taskId)
            }
          }
        }
  
        if (!timeout) {
          timeout = setTimeout(() => {
            e.sender.send(DOWNLOAD, ref, msg.taskId)
            timeout = null
          }, 1000)
        }
        resolve(true)
      })
    }, function () {
      fileName = fileName.split('.')
      fileName.splice(fileName.length - 2, 1)
      ref.fileUrl = path.resolve(msg.downloadPath, fileName.join('.'))
      fs.stat(ref.fileUrl, function (err, stats) {
        e.sender.send(FINISH, msg.taskId, (stats.size / 1000000).toFixed(2) + 'MiB', ref.fileUrl)
      })
    })
  },
  handlePause: function (e, msg) {
    try {
      kill(msg, 9)
    } catch (error) {
      console.log(error)
    }
  },
  handleDelete: function (e, msg) {
    fs.unlink(msg, function (err) {
      if (err) {
        console.log(err)
      }
    })
  }
}