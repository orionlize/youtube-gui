import React from 'react'
import { Row, Col, Progress, Space } from 'antd'

import useDownload, { DownloadTask, DownloadStatus } from '@/store/download.hooks'
import styles from './index.module.sass'
import './assets/iconfont/iconfont'

export default function DownloadCell (props: {task: DownloadTask}) {
  const { task } = props
  const { pauseDownloadTask, startDownloadTask, deleteDownloadTask } = useDownload()

  const status = React.useCallback(() => {
    switch (task.status) {
      case DownloadStatus.Downloading:
        return task.speed
      case DownloadStatus.Finished:
        return '下载完成'
      case DownloadStatus.Pause:
        return '已暂停'
      case DownloadStatus.Deleted:
        return '已删除'
      default:
        return '准备中'
    }
  }, [task.status, task.speed])

  const time = React.useCallback(() => {
    switch (task.status) {
      case DownloadStatus.Finished:
        return `完成时间:${task.waitingTime}`
      case DownloadStatus.Downloading:
        return `剩余时间:${task.waitingTime}`
      default:
        return ''
    }
  }, [task.status, task.waitingTime])

  const downloadIcon = React.useCallback(() => {
    const pre = '#icon-'
    if (task.status === DownloadStatus.Downloading) {
      return pre + 'zanting'
    }
    if (task.status === DownloadStatus.Pause || task.status === DownloadStatus.Deleted) {
      return pre + 'xiazai'
    }

    return ''
  }, [task.status])

  const clickPause = React.useCallback(() => {
    let timeout: any = null
    return function () {
      if (!timeout) {
        setTimeout(() => {
          if (task.status === DownloadStatus.Downloading) {
            pauseDownloadTask(task)
          }else if (task.status === DownloadStatus.Pause || task.status === DownloadStatus.Deleted) {
            startDownloadTask(task)
          }
          timeout = null
        }, 100)
      }
    }
  }, [pauseDownloadTask, startDownloadTask, task])

  const clickDelete = React.useCallback(() => {
    deleteDownloadTask(task)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pauseDownloadTask, startDownloadTask, task])

  return <div className={styles['download']}>
    <div className={styles['download_cell']}>
      <svg className={styles['download_cell-mp4_icon']}>
        <use xlinkHref='#icon-MP4' />
      </svg>
      <Row style={{width: '548px'}}>
        <Col span='1' />
        <Col span='19' className={styles['download_cell-filename']}>{task.fileName}</Col>
        <Col span='1' />
        <Col span='2' style={{textAlign: 'right', marginTop: '8px'}}>
          {task.pid !== 0 && <svg className={styles['download_cell-pause_icon']} onClick={clickPause()}>
            <use xlinkHref={downloadIcon()} />
          </svg>}
          {task.status !== DownloadStatus.Deleted && <svg className={styles['download_cell-delete_icon']} onClick={clickDelete}>
            <use xlinkHref='#icon-shanchu1' />
          </svg>}
        </Col>
        <Col span='24'><Space size={[0, 12]}/></Col>
        <Col span='1' />
        <Col span='19'>{task.status !== DownloadStatus.Deleted && `${task.fileSize} 已下载:${task.percentage} ${time()}`}</Col>
        <Col span='3' style={{textAlign: 'right'}}>{status()}</Col>
        <Col span='1' />
        <Col span='1' />
        <Col span='22'>
          {task.status !== DownloadStatus.Deleted && <Progress percent={parseInt(task.percentage || '')} status={task.status !== DownloadStatus.Finished ? 'active' : 'normal' } showInfo={false} />}
        </Col>
      </Row>
    </div>
  </div>
}