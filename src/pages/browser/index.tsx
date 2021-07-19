import { Component } from 'react';
import layout from '@/components/layout'
import styles from './index.module.sass'

@layout()
export default class Browser extends Component<{visible: boolean}, {}> {
  render() {
    return <div className={styles['browser']}>
      <div className={styles['browser-header']}></div>
      <webview className={styles['browser-content']} src='https://www.youtube.com' />
      <div className={styles['browser-footer']}></div>
    </div>
  }
}
