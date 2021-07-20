import React, { Component } from 'react';
import useModel, { items } from '@/store'
import layout from '@/components/layout'
import styles from './index.module.sass'

@layout
export default class Browser extends Component<{visible: boolean}, {url: string}> {

  constructor(props: any) {
    super(props)
    this.clickDownload = this.clickDownload.bind(this)
    this.state = {
      url: 'https://www.youtube.com'
    }
  }

  webviewRef = React.createRef<HTMLWebViewElement>()

  clickDownload() {
    console.log(this.state.url)
  }

  componentDidMount() {
    const that = this
    this.webviewRef.current?.addEventListener('did-start-loading', (e) => {
      that.setState({
        url: this.webviewRef.current?.attributes.getNamedItem('src')?.value!
      })
    })
  }

  render() {
    const { url } = this.state
    const isVideoUrl = url.indexOf('https://www.youtube.com/watch') === 0 && useModel.data?.select === Object.keys(items)[0]

    return <div className={styles['browser']}>
      <div className={styles['browser-header']}></div>
      <webview ref={this.webviewRef} className={styles['browser-content']} src='https://www.youtube.com' onLoad={(e) => {
        console.log(e)
      }} />
      <button style={{visibility: isVideoUrl ? 'visible' : 'collapse'}} className={styles['browser-button']} onClick={this.clickDownload}>下载视频</button>
    </div>
  }
}
