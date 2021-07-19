import React from 'react';

import Menu from '@/components/menu'

import useSelect, { items } from '@/store'

import Browser from './pages/browser'
import Setting from './pages/setting'

import styles from './App.module.sass'

function App() {
  const { select } = useSelect()

  return (
    <div className={styles['app']}>
      <Menu />
      <Browser visible={select === Object.keys(items)[0]} />
      <Setting visible={select === Object.keys(items)[2]} />
    </div>
  );
}

export default App;
