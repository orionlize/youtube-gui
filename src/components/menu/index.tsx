import classNames from 'classnames'
import useSelect, { items } from '@/store/menu'
import styles from './index.module.sass'

export default function Menu() {
  const { select, updateSelect } = useSelect()

  return <div className={styles['menu']}>
    {Object.keys(items).map(key => 
    <div 
      key={key} 
      className={classNames(styles['menu-item'], {[styles['menu-item_select']]: select === key})} 
      onClick={e => {
        updateSelect(key)
      }}
      >
        {items[key]}
      </div>)}
  </div>
}
