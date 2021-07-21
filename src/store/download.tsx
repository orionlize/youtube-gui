import React from 'react'
import ReactDOM from 'react-dom'

import useDownload from '@/store/download.hooks'
import { DOWNLOAD } from '@/const'

const electron = window.require('electron')

const downloadMount = new DocumentFragment()

function Download () {
  const { updateTask } = useDownload()
  React.useEffect(() => {
    const _updateTask = function (_: any, data: string[], taskId: string) {
      updateTask(data, taskId, (i: number) => {
        useDownload.data!.setDownloadQueue(draft => {
          draft[i].percentage = data[0]
          draft[i].fileSize = data[1]
          draft[i].speed = data[2]
          draft[i].waitingTime = data[3]

          return draft.slice()
        })
      })
    }

    electron.ipcRenderer.on(DOWNLOAD, _updateTask)
    
    return () => {
      electron.ipcRenderer.off(DOWNLOAD, _updateTask)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

ReactDOM.render(<Download />, downloadMount)