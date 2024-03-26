import styles from './index.module.css'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import * as ScrollArea from '@radix-ui/react-scroll-area'

type TableItem = {
  action: string
  hotkey: string
}

const invoices: TableItem[] = [
  {
    action: '切换是否显示翻译',
    hotkey: 'ctrl+shift+v',
  },
  {
    action: '切换听写模式',
    hotkey: 'ctrl+v',
  },
  {
    action: '暂停打字',
    hotkey: 'enter',
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
                    <TableCell className="dark:text-white">{invoice.action}</TableCell>
                    <TableCell className="dark:text-white">
                      <KeyMap keybinding={invoice.hotkey} />
                    </TableCell>
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

function DisplayKeymap(raw: string) {
  return raw
    .split('+')
    .map((x) => x[0].toUpperCase() + x.slice(1))
    .join(' + ')
}

interface KeyMapProps {
  keybinding: string
}

function KeyMap({ keybinding }: KeyMapProps) {
  return (
    <div className="flex">
      <div className="grow" />
      <div className="rounded-md bg-gray-100 px-1.5 dark:bg-gray-700">{DisplayKeymap(keybinding)}</div>
      <div className="grow" />
    </div>
  )
}
