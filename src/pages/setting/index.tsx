import { Component } from 'react'
import { Button, Input, List, Select, message } from 'antd'
import layout from '@/components/layout'
import styles from './index.module.sass'
import { LOCAL_WRITE } from '@/const'

const electron = window.require('electron')
const { LOCAL_READ } = require('../../const/index')

@layout
export default class Setting extends Component<{visible: boolean}, {
  dataSource: any[][]
  type: string,
  ip: string
}> {
  constructor(props: any) {
    super(props)
    this.updateSetting = this.updateSetting.bind(this)
    this.showReloadToast = this.showReloadToast.bind(this)
    this.onSelectChange = this.onSelectChange.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onSave = this.onSave.bind(this)
  }

  state = {
    dataSource: [],
    type: '',
    ip: '',
  }

  componentDidMount () {
    electron.ipcRenderer.once(LOCAL_READ, this.updateSetting)
    electron.ipcRenderer.on(LOCAL_WRITE, this.showReloadToast)
    electron.ipcRenderer.send(LOCAL_READ)
  }
  componentWillUnmount() {
    electron.ipcRenderer.on(LOCAL_WRITE, this.showReloadToast)
  }

  updateSetting (e: any, msg: any) {
    const keys = Object.keys(msg)
    const dataSource: any[][] = []
    for(const key of keys) {
      dataSource.push([key, msg[key]])
      this.setState(msg[key])
    }
    this.setState({
      dataSource: dataSource
    })
  }

  showReloadToast () {
    message.info('重启应用后生效')
  }

  onSelectChange (e: string) {
    this.setState({
      type: e
    })
  }
    
  onChange (e: any) {
    this.setState({
      ip: e.target.value
    })
  }

  onSave () {
    const { type, ip } = this.state
    const config: {[key: string]: any} = {}
    config.proxy = {
      type,
      ip
    }
    electron.ipcRenderer.send(LOCAL_WRITE, config)
  }

  renderItem(item: any[]) {
    switch (item[0]) {
      case 'proxy':
        const { type, ip } = this.state
        const selectBefore = <Select size='large' value={type} className="select-before" onChange={this.onSelectChange}>
            <Select.Option value="socks://">socks://</Select.Option >
            <Select.Option value="http://">http://</Select.Option >
            <Select.Option value="https://">https://</Select.Option >
          </Select>
        return <Input size='large' value={ip} addonBefore={selectBefore} onChange={this.onChange} />
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
