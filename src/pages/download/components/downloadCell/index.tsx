import React from 'react'
import { Row, Col, Progress, Space } from 'antd'

import useDownload, { DownloadTask, DownloadStatus } from '@/store/download.hooks'
import styles from './index.module.sass'
import './assets/iconfont/iconfont'

export default function DownloadCell (props: {task: DownloadTask}) {
  const { task } = props
  const { pauseDownloadTask, startDownloadTask } = useDownload()

  const status = React.useCallback(() => {
    switch (task.status) {
      case DownloadStatus.Downloading:
        return task.speed
      case DownloadStatus.Finished:
        return '下载完成'
      case DownloadStatus.Pause:
        return '已暂停'
      default:
        return '准备中'
    }
  }, [task.status, task.speed])

  const time = React.useCallback(() => {
    switch (task.status) {
      case DownloadStatus.Finished:
        return `用时:${task.waitingTime}`
      case DownloadStatus.Downloading:
        return `剩余:${task.waitingTime}`
      default:
        return ''
    }
  }, [task.status, task.waitingTime])

  const downloadIcon = React.useCallback(() => {
    const pre = '#icon-'
    if (task.status === DownloadStatus.Downloading) {
      return pre + 'zanting'
    }
    if (task.status === DownloadStatus.Pause) {
      return pre + 'xiazai'
    }

    return ''
  }, [task.status])

  return <div className={styles['download']}>
    <div className={styles['download_cell']}>
      <svg className={styles['download_cell-mp4_icon']}>
        <use xlinkHref='#icon-MP4' />
      </svg>
      <Row style={{width: '548px'}}>
        <Col span='1' />
        <Col span='20' className={styles['download_cell-filename']}>{task.fileName}</Col>
        <Col span='2' style={{textAlign: 'right'}}>
          <svg className={styles['download_cell-pause_icon']} onClick={() => {
            if (task.status === DownloadStatus.Downloading) {
              pauseDownloadTask(task)
            }else if (task.status === DownloadStatus.Pause) {
              startDownloadTask(task)
            }
          }}>
            <use xlinkHref={downloadIcon()} />
          </svg>
        </Col>
        <Col span='24'><Space size={[0, 12]} /></Col>
        <Col span='1' />
        <Col span='19'>{`${task.fileSize} 已下载:${task.percentage} ${time()}`}</Col>
        <Col span='3' style={{textAlign: 'right'}}>{status()}</Col>
        <Col span='1' />
        <Col span='1' />
        <Col span='22'>
          <Progress percent={parseInt(task.percentage || '')} status={task.status !== DownloadStatus.Finished ? 'active' : 'normal' } showInfo={false} />
        </Col>
      </Row>
    </div>
  </div>
}