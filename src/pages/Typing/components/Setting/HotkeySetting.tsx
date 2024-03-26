import styles from './index.module.css'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import type { Dispatch, SetStateAction } from 'react'
import { memo, useEffect, useState } from 'react'

type TableItem = {
  action: string
  hotkey: string
}

const initKeyMaps: TableItem[] = [
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
  const [keyMaps, setKeyMaps] = useState<TableItem[]>(initKeyMaps)

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
                {keyMaps.map((item, index) => (
                  <TableRow key={item.action}>
                    <TableCell className="dark:text-white">{item.action}</TableCell>
                    <TableCell className="dark:text-white">
                      <KeyMap hotkey={item.hotkey} action={item.action} index={index} setKeyMaps={setKeyMaps} />
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
  if (raw.length === 0) {
    return '未设置'
  } else {
    return raw
      .split('+')
      .map((x) => x[0].toUpperCase() + x.slice(1))
      .join(' + ')
  }
}

interface KeyMapProps {
  hotkey: string
  action: string
  index: number
  setKeyMaps: Dispatch<SetStateAction<TableItem[]>>
}

// eslint-disable-next-line react/display-name
// eslint-disable-next-line react/prop-types
const KeyMap = memo<KeyMapProps>(({ hotkey, action, index, setKeyMaps }) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const displayKeymap = DisplayKeymap(hotkey)

  useEffect(() => {
    if (dialogOpen) {
      const onKeyDown = (e: KeyboardEvent) => {
        e.preventDefault()
        e.stopPropagation()
        // console.log(`key down: ${e.key}`)
        if (e.key === 'Backspace') {
          // setCurrentKeymap('')
          setKeyMaps((prev) => {
            const newKeyMaps = [...prev]
            newKeyMaps[index].hotkey = ''
            return newKeyMaps
          })
        } else {
          // setCurrentKeymap((prev) => (prev === '' ? e.key : prev + '+' + e.key))
          setKeyMaps((prev) => {
            const newKeyMaps = [...prev]
            if (newKeyMaps[index].hotkey === '') {
              newKeyMaps[index].hotkey = e.key
            } else {
              newKeyMaps[index].hotkey += '+' + e.key
            }
            return newKeyMaps
          })
        }
      }
      const onKeyUp = (e: KeyboardEvent) => {
        e.preventDefault()
        e.stopPropagation()
        // console.log(`key up: ${e.key}`)
      }
      window.addEventListener('keydown', onKeyDown)
      window.addEventListener('keyup', onKeyUp)
      return () => {
        window.removeEventListener('keydown', onKeyDown)
        window.removeEventListener('keyup', onKeyUp)
      }
    }
  })

  return (
    <div className="flex">
      <div className="grow" />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <div className="rounded-md bg-gray-100 px-1.5 dark:bg-gray-700">{displayKeymap}</div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex">
              <DialogTitle className="text-slate-500 dark:text-slate-400">设置快捷键</DialogTitle>
              <div className="grow" />
              <DialogDescription>{action}</DialogDescription>
            </div>
          </DialogHeader>
          <Input type="text" placeholder={displayKeymap} />
        </DialogContent>
      </Dialog>
      <div className="grow" />
    </div>
  )
})
KeyMap.displayName = 'KeyMap'
