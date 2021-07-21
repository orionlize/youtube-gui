import { DOWNLOAD } from '@/const'
import { getDownloadShell } from '@/utils/shell'
import { createModel } from 'hox'
import React from 'react'
import { useImmer } from 'use-immer'
import useConfig from './config'

enum DownloadStatus {
  Ready,
  Pause,
  Downloading,
  Finished,
  Deleted
}

class DownloadTask {
  status: DownloadStatus = DownloadStatus.Ready
  pid?: number
  fileName?: string
  fileSize?: string
  speed?: string
  percentage?: string
  waitingTime?: string
  fileUrl?: string
  taskId: string = ''
}

const electron = window.require('electron')

export const downloadMap = new Map<string, number>()

function useDownload () {
  const [ downloadQueue, setDownloadQueue ] = useImmer<DownloadTask[]>([])
  const [ waitingQueue, setWaitingQueue ] = useImmer<DownloadTask[]>([])
  const [ finishQueue, setFinishQueue ] = useImmer<DownloadTask[]>([])
  const [ deletedQueue, setDeletedQueue ] = useImmer<DownloadTask[]>([])

  const { maxDownloadTask } = useConfig()

  console.log(downloadQueue)

  function _readyToDownload () {
    if (waitingQueue.length > 0 && downloadQueue.length < maxDownloadTask) {
      setWaitingQueue(draft => {
        setDownloadQueue(_draft => {
          const task = draft.pop()!
          task.status = DownloadStatus.Downloading
          _draft.push(task)
          downloadMap.set(task.taskId, _draft.length - 1)
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
        downloadMap.set(task.taskId, draft.length - 1)
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
    task.status = DownloadStatus.Finished
    setDownloadQueue(draft => {
      draft = draft.filter((_: DownloadTask) => _.taskId !== task.taskId)
      downloadMap.delete(task.taskId)
      setFinishQueue(_draft => {
        _draft.push(task)
      })

      _readyToDownload()
    })
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
    })
  }

  function startDownloadTask (task: DownloadTask) {
    if (task.status === DownloadStatus.Deleted) {
      setDeletedQueue(draft => {
        draft = draft.filter((_: DownloadTask) => _.taskId !== task.taskId)
      })
    } else if (task.status === DownloadStatus.Pause) {
      setWaitingQueue(draft => {
        draft = draft.filter((_: DownloadTask) => _.taskId !== task.taskId)
      })
    }

    addDownloadTask(task.taskId)
  }

  const updateTask = (data: string[], taskId: string, update: Function) => {
    setDownloadQueue(draft => {
      const i = downloadMap.get(taskId)!
      if (!Number.isNaN(i)) {
        update(i)
      }
    })
  }

  return {
    downloadQueue, waitingQueue, finishQueue, deletedQueue, setDownloadQueue,
    addDownloadTask, finishDownloadTask, pauseDownloadTask, removeDownloadTask, startDownloadTask, updateTask
  }
}

export default createModel(useDownload)