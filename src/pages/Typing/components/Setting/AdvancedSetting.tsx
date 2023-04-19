import styles from './index.module.css'
import { isIgnoreCaseAtom, isTextSelectableAtom, randomConfigAtom } from '@/store'
import { Switch } from '@headlessui/react'
import { useAtom } from 'jotai'
import { useCallback } from 'react'

export default function AdvancedSetting() {
  const [randomConfig, setRandomConfig] = useAtom(randomConfigAtom)
  const [isIgnoreCase, setIsIgnoreCase] = useAtom(isIgnoreCaseAtom)
  const [isTextSelectable, setIsTextSelectable] = useAtom(isTextSelectableAtom)

  const onToggleRandom = useCallback(
    (checked: boolean) => {
      setRandomConfig((prev) => ({
        ...prev,
        isOpen: checked,
      }))
    },
    [setRandomConfig],
  )

  const onToggleIgnoreCase = useCallback(
    (checked: boolean) => {
      setIsIgnoreCase(checked)
    },
    [setIsIgnoreCase],
  )

  const onToggleTextSelectable = useCallback(
    (checked: boolean) => {
      setIsTextSelectable(checked)
    },
    [setIsTextSelectable],
  )

  return (
    <div className={styles.tabContent}>
      <div className={styles.section}>
        <span className={styles.sectionLabel}>章节乱序</span>
        <span className={styles.sectionDescription}>开启后，每次练习章节中单词会随机排序。下一章节生效</span>
        <div className={styles.switchBlock}>
          <Switch checked={randomConfig.isOpen} onChange={onToggleRandom} className="switch-root">
            <span aria-hidden="true" className="switch-thumb" />
          </Switch>
          <span className="text-right text-xs font-normal leading-tight text-gray-600">{`随机已${
            randomConfig.isOpen ? '开启' : '关闭'
          }`}</span>
        </div>
      </div>
      <div className={styles.section}>
        <span className={styles.sectionLabel}>是否忽略大小写</span>
        <span className={styles.sectionDescription}>开启后，输入时不区分大小写，如输入“hello”和“Hello”都会被认为是正确的</span>
        <div className={styles.switchBlock}>
          <Switch checked={isIgnoreCase} onChange={onToggleIgnoreCase} className="switch-root">
            <span aria-hidden="true" className="switch-thumb" />
          </Switch>
          <span className="text-right text-xs font-normal leading-tight text-gray-600">{`忽略大小写已${
            isIgnoreCase ? '开启' : '关闭'
          }`}</span>
        </div>
      </div>
      <div className={styles.section}>
        <span className={styles.sectionLabel}>是否允许选择文本</span>
        <span className={styles.sectionDescription}>开启后，可以通过鼠标选择文本 </span>
        <div className={styles.switchBlock}>
          <Switch checked={isTextSelectable} onChange={onToggleTextSelectable} className="switch-root">
            <span aria-hidden="true" className="switch-thumb" />
          </Switch>
          <span className="text-right text-xs font-normal leading-tight text-gray-600">{`选择文本已${
            isTextSelectable ? '开启' : '关闭'
          }`}</span>
        </div>
      </div>
    </div>
  )
}
