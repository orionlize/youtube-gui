import React from 'react'
import ReactDOM from 'react-dom'

import useDownload from '@/store/download.hooks'
import { DOWNLOAD } from '@/const'

const electron = window.require('electron')

const downloadMount = new DocumentFragment()

function Download () {
  const { updateTask } = useDownload()

  React.useEffect(() => {
    const _updateTask = function (_: any, data: string[], taskId: string){
      updateTask(data, taskId)
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