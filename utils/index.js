const exec = require('child_process').exec

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
	}
}