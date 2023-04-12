import { randomConfigAtom } from '@/store'
import { Switch } from '@headlessui/react'
import { useAtom } from 'jotai'
import { useCallback } from 'react'
import styles from './index.module.css'

export default function AdvancedSetting() {
  const [randomConfig, setRandomConfig] = useAtom(randomConfigAtom)

  const onToggleRandom = useCallback(
    (checked: boolean) => {
      setRandomConfig((prev) => ({
        ...prev,
        isOpen: checked,
      }))
    },
    [setRandomConfig],
  )

  return (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <span className={styles.sectionLabel}>章节乱序</span>
        <span className={styles.sectionDescription}>开启后，每次练习章节中单词会随机排序</span>
        <div className={styles.switchBlock}>
          <Switch checked={randomConfig.isOpen} onChange={onToggleRandom} className="switch-root">
            <span aria-hidden="true" className="switch-thumb" />
          </Switch>
          <span className="text-right text-xs font-normal leading-tight text-gray-600">{`随机已${
            randomConfig.isOpen ? '开启' : '关闭'
          }`}</span>
        </div>
      </div>
    </div>
  )
}
