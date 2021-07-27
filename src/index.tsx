import React from 'react';
import ReactDOM from 'react-dom';

import App from './app';
import './store/download'

import './index.css';
import reportWebVitals from './reportWebVitals';

import { READ_CONFIG } from '@/const'
import configStore from '@/store/config'

const { ipcRenderer } = window.require('electron')

ipcRenderer.once(READ_CONFIG, (e, config: any) => {
  configStore.data?.setIp(config.proxy.ip)
  configStore.data?.setProxyType(config.proxy.type)
  configStore.data?.setMaxDownloadTask(config.maxDownloadTask)
  configStore.data?.setDownloadPath(config.downloadPath)
})

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'), () => {
    setTimeout(() => {
      ipcRenderer.send(READ_CONFIG)
    }, 5000);
  }
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
