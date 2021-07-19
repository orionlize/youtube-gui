import { Component } from 'react'
import { ipcRenderer } from 'electron'
import layout from '@/components/layout'
import styles from './index.module.sass'

const LOCAL_PROXY = require('@/const/index')

@layout
export default class Setting extends Component<{visible: boolean}, {}> {
  constructor(props: any) {
    super(props)
    // ipcRenderer.send(LOCAL_PROXY, '123')
    console.log(window)
  }

  render() {
    return <div className={styles['setting']}>
      <div className={styles['setting-footer']} />
      <div className={styles['setting-content']} />
      <div className={styles['setting-header']} />
    </div>
  }
}
