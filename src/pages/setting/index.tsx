import { withModel } from 'hox'
import { Component } from 'react'
import { Button, Input, List, Select, message } from 'antd'
import layout from '@/components/layout'
import useConfig from '@/store/config'
import styles from './index.module.sass'
import { LOCAL_WRITE, READ_CONFIG } from '@/const'

const electron = window.require('electron')

@layout
class Setting extends Component<{visible: boolean, config: any}, {
  dataSource: any[][]
  type: string,
  ip: string
}> {
  constructor(props: any) {
    super(props)
    this.onSave = this.onSave.bind(this)
    this.readConfig = this.readConfig.bind(this)
  }

  state = {
    dataSource: [],
    type: '',
    ip: '',
  }

  uploadRef: any = null
  setUploadRef = (node: any) => {
    this.uploadRef = node
  }

  componentDidMount () {
    electron.ipcRenderer.once(READ_CONFIG, this.readConfig)
    electron.ipcRenderer.send(READ_CONFIG)
    electron.ipcRenderer.on(LOCAL_WRITE, this.showReloadToast)
  }
  componentWillUnmount() {
    electron.ipcRenderer.on(LOCAL_WRITE, this.showReloadToast)
  }
  componentDidUpdate () {
    if (this.uploadRef) {
      this.uploadRef.input.webkitdirectory = true
      this.uploadRef.input.directory = true
    }
  }

  showReloadToast () {
    message.info('重启应用后生效')
  }

  readConfig (e: any, config: any) {
      useConfig.data?.setIp(config.proxy.ip)
      useConfig.data?.setProxyType(config.proxy.type)
      useConfig.data?.setMaxDownloadTask(config.maxDownloadTask)
      useConfig.data?.setDownloadPath(config.downloadPath)

      const keys = Object.keys(config)
      const dataSource: any[][] = []
      for(const key of keys) {
        dataSource.push([key, config[key]])
      }
      this.setState({
        dataSource: dataSource
    })
  }

  onSelectChange (item: any, e: string) {
    item[1].type = e
  }
    
  onChange (item: any, e: any) {
    item[1].ip = e.target.value
    this.forceUpdate()
  }

  onChangeMaxDownloadTask (item: any, e: any) {
    item[1] = e.target.value
    this.forceUpdate()
  }

  async onChangeDownloadPath (item: any, e: any) {

    const result = await electron.remote.dialog.showOpenDialog({
      properties: ['openDirectory'],
    })

    if (result.filePaths[0]) {
      item[1] = result.filePaths[0]
      this.forceUpdate()
    }
  }


  onSave () {
    const { dataSource } = this.state
    const config: {[key: string]: any} = {}

    for(const data of dataSource) {
      config[data[0]] = data[1]
    }
    
    useConfig.data?.setIp(config.proxy.ip)
    useConfig.data?.setProxyType(config.proxy.type)
    useConfig.data?.setMaxDownloadTask(config.maxDownloadTask)
    useConfig.data?.setDownloadPath(config.downloadPath)

    electron.ipcRenderer.send(LOCAL_WRITE, config)
  }

  renderItem(item: any[]) {
    switch (item[0]) {
      case 'proxy':
        const { type, ip } = item[1]
        const selectBefore = <Select size='large' value={type} onChange={this.onSelectChange.bind(this, item)}>
            <Select.Option value="socks://">socks://</Select.Option >
            <Select.Option value="http://">http://</Select.Option >
            <Select.Option value="https://">https://</Select.Option >
          </Select>
        return <Input size='large' value={ip} addonBefore={selectBefore} onChange={this.onChange.bind(this, item)} />
      case 'maxDownloadTask':
        return <Input type='number' addonBefore='最大任务数: ' value={item[1]} onChange={this.onChangeMaxDownloadTask.bind(this, item)} />
      case 'downloadPath':
        return <div onClick={this.onChangeDownloadPath.bind(this, item)} >
          <Input 
            id='upload'
            value={item[1]}
            addonBefore='下载路径: '
          />
        </div>
      default:
        return null
    }
  }

  render() {
    const { dataSource } = this.state
    return <div className={styles['setting']}>
      <List 
        header={<div className={styles['setting-header']}>设置</div>} 
        footer={<div className={styles['setting-footer']}>
          <Button size='large' onClick={this.onSave}>保存</Button>
        </div>}
        dataSource={dataSource}
        renderItem={item => (
          <List.Item>
            {this.renderItem(item)}
          </List.Item>
        )}
      />
    </div>
  }
}

export default withModel(useConfig, config => ({
  config
}))(Setting)