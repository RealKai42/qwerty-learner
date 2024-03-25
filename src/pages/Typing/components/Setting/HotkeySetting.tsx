import styles from './index.module.css'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import * as ScrollArea from '@radix-ui/react-scroll-area'

const invoices = [
  {
    action: '切换是否显示翻译',
    hotkey: 'Ctrl + Shift + V',
  },
]

export default function HotkeySetting() {
  return (
    <ScrollArea.Root className="flex-1 select-none overflow-y-auto">
      <ScrollArea.Viewport className="h-full w-full px-3">
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <span className={styles.sectionLabel}>快捷键设置</span>
          </div>
          <div className={styles.section}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">操作</TableHead>
                  <TableHead className="text-center">快捷键</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.action}>
                    <TableCell>{invoice.action}</TableCell>
                    <TableCell>{invoice.hotkey}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar className="flex touch-none select-none bg-transparent " orientation="vertical" />
    </ScrollArea.Root>
  )
}
