const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const { LOCAL_READ } = require('../const/index')

module.exports = {
	exec: function (command, commandPath) {
		let workerProcess 
		function runCommand(command, commandPath) {
			workerProcess = exec(command, commandPath)
			workerProcess.stdout.on('data', function (data) {
				console.log(data)
			})
			workerProcess.stderr.on('data', function (data) {
				console.log(data)
			})
			workerProcess.on('close', function (code) {
				console.log('end:', code)
			})
		}
		runCommand(command, commandPath)
	},
	handleReadMessage: function (e, _) {
		fs.readFile(path.resolve(__dirname, '..', 'config.json'), 'utf-8', function(err, data) {
			if (!err) {
				e.sender.send(LOCAL_READ, data)
			} else {
				// 处理异常
			}
		})
  }
}