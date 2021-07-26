import layout from '@/components/layout'
import { List, Tabs } from 'antd'
import React from 'react'

import DownloadCell from './components/downloadCell'
import useDownload, { DownloadTask } from '@/store/download.hooks'
import { withModel } from 'hox'

@layout
class DownLoad extends React.Component<{visible: boolean, download: {
  downloadQueue: DownloadTask[]
  finishQueue: DownloadTask[]
  waitingQueue: DownloadTask[]
  deletedQueue: DownloadTask[]
}}> {

  callback(key: any) {
    console.log(key);
  }

  render() {
    const { download } = this.props

    return <Tabs centered size='large' onChange={this.callback} type="card">
    <Tabs.TabPane tab="下载中" key="downloading">
      <List
        dataSource={download.downloadQueue.concat(download.waitingQueue)} 
        renderItem={(task) => <DownloadCell key={task.taskId} task={task} />} />
    </Tabs.TabPane>
    <Tabs.TabPane tab="已完成" key="finished">
      <List 
        dataSource={download.finishQueue} 
        renderItem={(task) => <DownloadCell key={task.taskId} task={task} />} />
    </Tabs.TabPane>
    <Tabs.TabPane tab="已删除" key="deleted">
      <List 
        dataSource={download.deletedQueue} 
        renderItem={(task) => <DownloadCell key={task.taskId} task={task} />} />
    </Tabs.TabPane>
  </Tabs>
  }
}

export default withModel(useDownload, download => ({
  download
}))(DownLoad)