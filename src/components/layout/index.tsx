import { Component } from 'react'
import styles from './index.module.sass'

export default function layout(WrappedComponent: any) {
  return class extends Component<{visible: boolean}, {}> {
    render() {
      const { visible } = this.props
      return (
        <div className={styles['hoc']} style={{width: visible ? 'calc(100% - 100px)' : '0', visibility: visible ? 'visible' : 'hidden'}}>
          <WrappedComponent {...this.props} />
        </div>
      )
    }
  } as typeof WrappedComponent
}