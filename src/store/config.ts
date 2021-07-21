import React from 'react'
import { createModel } from 'hox'

function useConfig () {
  const [ proxyType, setProxyType ] = React.useState('socks://')
  const [ ip, setIp ] = React.useState('127.0.0.1:1080')
  const [ maxDownloadTask, setMaxDownloadTask ] = React.useState(4)

  return {
    proxyType, ip, maxDownloadTask,
    setProxyType, setIp, setMaxDownloadTask
  }
}

export default createModel(useConfig)