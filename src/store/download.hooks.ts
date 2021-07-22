import { DOWNLOAD, PAUSE } from '@/const'
import { getDownloadShell } from '@/utils/shell'
import { createModel } from 'hox'
import { useImmer } from 'use-immer'
import useConfig from './config'

export enum DownloadStatus {
  Ready,
  Pause,
  Downloading,
  Finished,
  Deleted
}

export class DownloadTask {
  status: DownloadStatus = DownloadStatus.Ready
  pid?: number
  fileName: string = '获取中'
  fileSize: string = '获取中'
  speed?: string
  percentage: string = '0.0%'
  waitingTime: string = '00:00'
  fileUrl: string = ''
  taskId: string = ''
}

const electron = window.require('electron')

export const downloadMap = new Map<string, DownloadTask>()

function useDownload () {
  const [ downloadQueue, setDownloadQueue ] = useImmer<DownloadTask[]>([])
  const [ waitingQueue, setWaitingQueue ] = useImmer<DownloadTask[]>([])
  const [ finishQueue, setFinishQueue ] = useImmer<DownloadTask[]>([])
  const [ deletedQueue, setDeletedQueue ] = useImmer<DownloadTask[]>([])

  const { maxDownloadTask } = useConfig()

  // console.log(downloadQueue)

  function _analyzeData (data: string, task: DownloadTask) {
    const fileStart = data.indexOf('[download] Destination: ')
    const downloadStart = data.indexOf('[download]')
    const finish = data.search(/ in /)

    if (fileStart !== -1) {
      const fileEnd = data.search(/(\n|\r|(\r\n)|(\u0085)|(\u2028)|(\u2029))/)
      task.fileName = data.substring(24, fileEnd)
    } else if (downloadStart !== -1) {
      if (finish !== -1) {
        finishDownloadTask(task)
      }

      const percentageRegex = data.match(/\[download\] +([\s\S]*?) +of/)
      const fileSizeRegex = data.match(/of +([\s\S]*?) +at/)
      const speedRegex = data.match(/at +([\s\S]*?) +/)

      console.log(speedRegex)
      if (percentageRegex) {
        task.percentage = percentageRegex[1]
      }
      if (fileSizeRegex) {
        task.fileSize = fileSizeRegex[1]
      }
      task.speed = speedRegex ? speedRegex[1] : '0KiB/s'
      task.waitingTime = data.split(' ').pop()!
    }
  }

  function _readyToDownload () {
    if (waitingQueue.length > 0 && downloadQueue.length < maxDownloadTask) {
      setWaitingQueue(draft => {
        setDownloadQueue(_draft => {
          const task = draft.pop()!
          task.status = DownloadStatus.Downloading
          _draft.push(task)
          downloadMap.set(task.taskId, task)
        })
      })
    }
  }

  function addDownloadTask (taskId: string) {
    const task = new DownloadTask()
    task.taskId = taskId
    if (downloadQueue.length < maxDownloadTask) {
      task.status = DownloadStatus.Downloading
      setDownloadQueue(draft => {
        draft.push(task)
        downloadMap.set(task.taskId, task)
        electron.ipcRenderer.send(DOWNLOAD, {
          shell: getDownloadShell(taskId),
          taskId: taskId
        })
      })
    } else {
      task.status = DownloadStatus.Ready
      setWaitingQueue(draft => {
        draft.push(task)
      })
    }
  }

  function finishDownloadTask (task: DownloadTask) {
    if (task !== undefined) {
      setDownloadQueue(draft => {
        task.status = DownloadStatus.Finished
        draft = draft.filter((_: DownloadTask) => _.taskId !== task.taskId)
        downloadMap.delete(task.taskId)
        setFinishQueue(_draft => {
          _draft.push(task)
        })
        _readyToDownload()

        return draft
      }) 
    }
  }

  function removeDownloadTask (task: DownloadTask) {
    if (task.status === DownloadStatus.Ready || task.status === DownloadStatus.Pause) {
      setWaitingQueue(draft => {
        draft = draft.filter((_: DownloadTask) => _.taskId !== task.taskId)
      })
    } else if (task.status === DownloadStatus.Downloading) {
      setDownloadQueue(draft => {
        draft = draft.filter((_: DownloadTask) => _.taskId !== task.taskId)
        downloadMap.delete(task.taskId)
        _readyToDownload()
        // remove local file
      })
    }else if (task.status === DownloadStatus.Finished) {
      setFinishQueue(draft => {
        draft = draft.filter((_: DownloadTask) => _.taskId !== task.taskId)
        // remove local file
      })
    }

    task.status = DownloadStatus.Deleted
    setDeletedQueue(draft => {
      draft.push(task)
    })
  }

  function pauseDownloadTask (task: DownloadTask) {
    task.status = DownloadStatus.Pause
    setDownloadQueue(draft => {
      draft = draft.filter((_: DownloadTask) => _.taskId !== task.taskId)
      setWaitingQueue(_draft => {
        _draft.push(task)
      })
      _readyToDownload()

      electron.ipcRenderer.send(PAUSE, task.pid)

      return draft
    })
  }

  function startDownloadTask (task: DownloadTask) {
    if (task.status === DownloadStatus.Deleted) {
      setDeletedQueue(draft => {
        draft = draft.filter((_: DownloadTask) => _.taskId !== task.taskId)

        return draft
      })
    } else if (task.status === DownloadStatus.Pause) {
      setWaitingQueue(draft => {
        draft = draft.filter((_: DownloadTask) => _.taskId !== task.taskId)

        return draft
      })
    }

    addDownloadTask(task.taskId)
  }

  const updateTask = (_: any, data: string, taskId: string, pid: number) => {
    const task = downloadMap.get(taskId)!
    if (task !== undefined) {
      setDownloadQueue(draft => {
        if (task) {
          task.pid = pid
          _analyzeData(data, task)
        }

        return draft.slice()
      })
    }
  }

  return {
    downloadQueue, waitingQueue, finishQueue, deletedQueue, setDownloadQueue,
    addDownloadTask, finishDownloadTask, pauseDownloadTask, removeDownloadTask, startDownloadTask, updateTask
  }
}

export default createModel(useDownload)