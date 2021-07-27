import { createModel } from 'hox'
import { useImmer } from 'use-immer'
import { Modal, message } from 'antd'
import { DELETE, DOWNLOAD, PAUSE } from '@/const'
import { getDownloadVideoShell } from '@/utils/shell'
import useConfig from './config'
import React from 'react'

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

const downloadMap = new Map<string, DownloadTask>()
const finishMap = new Map<string, DownloadTask>()
const deletedMap = new Map<string, DownloadTask>()

function useDownload () {
  const [ downloadQueue, setDownloadQueue ] = useImmer<DownloadTask[]>([])
  const [ waitingQueue, setWaitingQueue ] = useImmer<DownloadTask[]>([])
  const [ finishQueue, setFinishQueue ] = useImmer<DownloadTask[]>([])
  const [ deletedQueue, setDeletedQueue ] = useImmer<DownloadTask[]>([])

  const { maxDownloadTask } = useConfig()

  React.useEffect(() => {
    if (waitingQueue.length > 0 && downloadQueue.filter(_ => _.status === DownloadStatus.Downloading).length < maxDownloadTask) {
      setWaitingQueue(draft => {
        const task = draft.splice(0, 1)[0]
        setDownloadQueue(_draft => {
          task.pid = 0
          task.status = DownloadStatus.Downloading
          _draft.push(task)
          electron.ipcRenderer.send(DOWNLOAD, {
            shell: getDownloadVideoShell(task.taskId),
            taskId: task.taskId
          })
        })
      })
    }
  }, [downloadQueue, waitingQueue])

  function addDownloadTask (taskId: string) {
    const task = downloadMap.get(taskId) || finishMap.get(taskId) || deletedMap.get(taskId) || new DownloadTask()
    if (task.status === DownloadStatus.Deleted) {
      Modal.confirm({
        content: '文件已删除,是否重新下载',
        onOk: function() {
          startDownloadTask(task)
        }
      })

      return
    } else if (task.status === DownloadStatus.Finished) {
      message.info('文件已下载')

      return
    }else if (task.status !== DownloadStatus.Ready) {
      return 
    }

    task.taskId = taskId

    if (downloadQueue.filter(_ => _.status === DownloadStatus.Downloading).length < maxDownloadTask) {
      task.status = DownloadStatus.Downloading
      setDownloadQueue(draft => {
        task.pid = 0
        if (!downloadMap.has(taskId)) {
          draft.push(task)
        }

        electron.ipcRenderer.send(DOWNLOAD, {
          shell: getDownloadVideoShell(taskId),
          taskId: taskId
        })
      })
    } else {
      task.status = DownloadStatus.Ready
      setWaitingQueue(draft => {
        draft.push(task)
      })
    }
    downloadMap.set(task.taskId, task)
  }

  function finishDownloadTask (_: any, taskId: string, fileSize: string, fileUrl: string) {
    const task = downloadMap.get(taskId)
    if (task !== undefined) {
      setDownloadQueue(draft => {
        task.status = DownloadStatus.Finished
        task.fileName = task.fileName.substring(0, task.fileName.lastIndexOf('.'))
        task.waitingTime = new Date().toUTCString()
        task.percentage = '100%'
        task.fileSize = fileSize
        task.fileUrl = fileUrl
        draft = draft.filter((_: DownloadTask) => _.taskId !== task.taskId)
        downloadMap.delete(task.taskId)
        finishMap.set(task.taskId, task)
        setFinishQueue(_draft => {
          _draft.push(task)
        })

        return draft
      }) 
    }
  }

  function deleteDownloadTask (task: DownloadTask) {
    if (task.status === DownloadStatus.Ready) {
      downloadMap.delete(task.taskId)
      setWaitingQueue(draft => {
        draft = draft.filter((_: DownloadTask) => _.taskId !== task.taskId)

        return draft
      })
    }else if (task.status === DownloadStatus.Downloading || task.status === DownloadStatus.Pause) {
      setDownloadQueue(draft => {
        draft = draft.filter((_: DownloadTask) => _.taskId !== task.taskId)
        downloadMap.delete(task.taskId)
        if (task.status === DownloadStatus.Downloading) {
          electron.ipcRenderer.send(PAUSE, task.pid)
        }

        electron.ipcRenderer.send(DELETE, task.fileUrl)

        return draft
      })
    }else if (task.status === DownloadStatus.Finished) {
      setFinishQueue(draft => {
        draft = draft.filter((_: DownloadTask) => _.taskId !== task.taskId)
        electron.ipcRenderer.send(DELETE, task.fileUrl)
        finishMap.delete(task.taskId)

        return draft
      })
    }

    task.status = DownloadStatus.Deleted
    deletedMap.set(task.taskId, task)
    setDeletedQueue(draft => {
      draft.push(task)
    })
  }

  function pauseDownloadTask (task: DownloadTask) {
    task.status = DownloadStatus.Pause
    setDownloadQueue(draft => {
      electron.ipcRenderer.send(PAUSE, task.pid)

      return draft
    })
  }

  function startDownloadTask (task: DownloadTask) {
    if (task.status === DownloadStatus.Deleted) {
      deletedMap.delete(task.taskId)
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

  const updateTask = (_: any, data: any, taskId: string) => {
    const task = downloadMap.get(taskId)!
    if (task !== undefined) {
      setDownloadQueue(draft => {
        if (task) {
          task.pid = data.pid
          task.fileName = data.fileName
          task.percentage = data.percentage
          task.fileSize = data.fileSize
          task.speed = data.speed
          task.waitingTime = data.waitingTime
          if (data.fileUrl) {
            task.fileUrl = data.fileUrl
          }
        }

        return draft.slice()
      })
    }
  }

  return {
    downloadQueue, waitingQueue, finishQueue, deletedQueue, setDownloadQueue,
    addDownloadTask, finishDownloadTask, pauseDownloadTask, deleteDownloadTask, startDownloadTask, updateTask
  }
}

export default createModel(useDownload)