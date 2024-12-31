import styles from './index.module.css'
import Footer from '@/components/Footer'
import * as ScrollArea from '@radix-ui/react-scroll-area'

export default function AboutSetting() {
  return (
    <ScrollArea.Root className="flex-1 select-none overflow-y-auto ">
      <ScrollArea.Viewport className="h-full w-full px-3">
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>版本号</span>
            <span className="text-left text-sm leading-tight text-gray-500">
              @Qwerty Learner Build <span className="select-all">{LATEST_COMMIT_HASH}</span>
            </span>
          </div>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>备案号</span>
            <span className="text-left text-sm leading-tight text-gray-500">
              <a
                className="cursor-pointer text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                href="https://beian.miit.gov.cn"
                target="_blank"
                rel="noreferrer"
              >
                鲁ICP备2022030649号
              </a>
            </span>
          </div>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>联系</span>
            <Footer />
            {/* <span className={styles.sectionDescription}></span> */}
          </div>
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent " orientation="vertical"></ScrollArea.Scrollbar>
    </ScrollArea.Root>
  )
}
