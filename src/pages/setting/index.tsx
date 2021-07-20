import { Component } from 'react'
import { Button, Input, List, Select } from 'antd'
import layout from '@/components/layout'
import styles from './index.module.sass'

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
    this.onSelectChange = this.onSelectChange.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  state = {
    dataSource: [],
    type: '',
    ip: '',
  }

  componentDidMount () {
    electron.ipcRenderer.once(LOCAL_READ, this.updateSetting)
    electron.ipcRenderer.send(LOCAL_READ)
  }

  updateSetting (e: any, msg: any) {
    const json = JSON.parse(msg)
    const keys = Object.keys(json)
    const dataSource: any[][] = []
    for(const key of keys) {
      dataSource.push([key, json[key]])
      this.setState(json[key])
    }
    this.setState({
      dataSource: dataSource
    })
  }

  onSelectChange (e: string) {
    this.setState({
      type: e
    })
  }
    
  onChange (e: any) {
    this.setState({
      ip: e
    })
  }

  renderItem(item: any[]) {
    switch (item[0]) {
      case 'proxy':
        const { type, ip } = this.state
        const selectBefore = <Select value={type} className="select-before" onChange={this.onSelectChange}>
            <Select.Option value="socks://">socks://</Select.Option >
            <Select.Option value="http://">http://</Select.Option >
            <Select.Option value="https://">https://</Select.Option >
          </Select>
        return <Input value={ip} addonBefore={selectBefore} onChange={this.onChange} />
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
          <Button>保存</Button>
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
