import React from 'react'
import { createModel } from 'hox'

function useConfig () {
  const [ proxyType, setProxyType ] = React.useState('socks://')
  const [ ip, setIp ] = React.useState('127.0.0.1:1080')
  const [ maxDownloadTask, setMaxDownloadTask ] = React.useState(5)
  const [ downloadPath, setDownloadPath ] = React.useState('.')

  const proxy = React.useCallback(() => {
    return proxyType.replace(/socks/, 'socks5') + ip
  }, [proxyType, ip])

  return {
    proxy, proxyType, ip, maxDownloadTask, downloadPath,
    setProxyType, setIp, setMaxDownloadTask, setDownloadPath
  }
}

export default createModel(useConfig)
