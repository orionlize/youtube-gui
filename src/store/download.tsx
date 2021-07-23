import React from 'react'
import ReactDOM from 'react-dom'

import useDownload from '@/store/download.hooks'
import { DOWNLOAD, FINISH } from '@/const'

const electron = window.require('electron')

const downloadMount = new DocumentFragment()

function Download () {
  const { updateTask, finishDownloadTask } = useDownload()
  React.useEffect(() => {
    electron.ipcRenderer.on(DOWNLOAD, updateTask)
    electron.ipcRenderer.on(FINISH, finishDownloadTask)
    
    return () => {
      electron.ipcRenderer.off(DOWNLOAD, updateTask)
      electron.ipcRenderer.off(FINISH, finishDownloadTask)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

ReactDOM.render(<Download />, downloadMount)