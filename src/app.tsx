import React from 'react';

import Menu from '@/components/menu'

import useSelect, { items } from '@/store/menu'

import Browser from './pages/browser'
import Setting from './pages/setting'

import styles from './app.module.sass'
import DownLoad from './pages/download';

function App() {
  const { select } = useSelect()

  return (
    <div className={styles['app']}>
      <Menu />
      <Browser visible={select === Object.keys(items)[0]} />
      <DownLoad visible={select === Object.keys(items)[1]} />
      <Setting visible={select === Object.keys(items)[2]} />
    </div>
  );
}

export default App;
