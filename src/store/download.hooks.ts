import { DOWNLOAD, PAUSE } from '@/const'
import { getDownloadViedeoShell } from '@/utils/shell'
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
    const task = downloadMap.get(taskId) || new DownloadTask()
    task.taskId = taskId

    if (downloadQueue.filter(_ => _.status === DownloadStatus.Downloading).length < maxDownloadTask) {
      task.status = DownloadStatus.Downloading
      setDownloadQueue(draft => {
        if (task.pid === undefined) {
          draft.push(task)
          downloadMap.set(task.taskId, task)
        }

        electron.ipcRenderer.send(DOWNLOAD, {
          shell: getDownloadViedeoShell(taskId),
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

  function finishDownloadTask (_: any, taskId: string, fileSize: string) {
    const task = downloadMap.get(taskId)
    if (task !== undefined) {
      setDownloadQueue(draft => {
        task.status = DownloadStatus.Finished
        task.fileName = task.fileName.substring(0, task.fileName.lastIndexOf('.'))
        task.waitingTime = new Date().toUTCString()
        task.percentage = '100%'
        task.fileSize = fileSize
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
      task.status = DownloadStatus.Pause
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
      setDownloadQueue(draft => {
        draft = draft.filter((_: DownloadTask) => _.taskId !== task.taskId)
        downloadMap.delete(task.taskId)

        return draft
      })
    }

    addDownloadTask(task.taskId)
  }

  const updateTask = (_: any, data: any, taskId: string, pid: number) => {
    const task = downloadMap.get(taskId)!
    if (task !== undefined) {
      setDownloadQueue(draft => {
        if (task) {
          task.pid = pid
          task.fileName = data.fileName
          task.percentage = data.percentage
          task.fileSize = data.fileSize
          task.speed = data.speed
          task.waitingTime = data.waitingTime
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