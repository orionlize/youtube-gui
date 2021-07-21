import React from 'react'
import { createModel } from 'hox'

export const items: {[key: string]: string} = {
  browser: '浏览器',
  download: '下载',
  settings: '设置'
}

function useSelect () {
  const [ select, setSelect ] = React.useState('browser')
  const updateSelect = (_: string) => setSelect(_)
  return {
    select,
    updateSelect
  }
}

export default createModel(useSelect)