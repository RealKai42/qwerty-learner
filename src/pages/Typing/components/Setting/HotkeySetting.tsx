import styles from './index.module.css'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
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
                {invoices.map((item) => (
                  <TableRow key={item.action}>
                    <TableCell className="dark:text-white">{item.action}</TableCell>
                    <TableCell className="dark:text-white">
                      <KeyMap {...item} />
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

function KeyMap({ hotkey, action }: TableItem) {
  return (
    <div className="flex">
      <div className="grow" />
      <Dialog>
        <DialogTrigger asChild>
          <div className="rounded-md bg-gray-100 px-1.5 dark:bg-gray-700">{DisplayKeymap(hotkey)}</div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex">
              <DialogTitle className="text-slate-500 dark:text-slate-400">设置快捷键</DialogTitle>
              <div className="grow" />
              <DialogDescription>{action}</DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button type="submit">保存更改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="grow" />
    </div>
  )
}
