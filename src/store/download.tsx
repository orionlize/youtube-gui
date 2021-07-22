import React from 'react'
import ReactDOM from 'react-dom'

import useDownload from '@/store/download.hooks'
import { DOWNLOAD } from '@/const'

const electron = window.require('electron')

const downloadMount = new DocumentFragment()

function Download () {
  const { updateTask } = useDownload()
  React.useEffect(() => {
    electron.ipcRenderer.on(DOWNLOAD, updateTask)
    
    return () => {
      electron.ipcRenderer.off(DOWNLOAD, updateTask)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

ReactDOM.render(<Download />, downloadMount)