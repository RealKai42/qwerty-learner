import { Dialog, Transition } from '@headlessui/react'
import classNames from 'classnames'
import { Fragment } from 'react'

export type Placement = 'left' | 'top' | 'right' | 'bottom'

interface DrawerProps {
  open?: boolean
  placement?: Placement
  onClose?: () => void
  children?: React.ReactNode
  classNames?: string
}

const transitionDirectionMap = {
  left: '-translate-x-full',
  right: 'translate-x-full',
  top: '-translate-y-full',
  bottom: 'translate-y-full',
}
export default function Drawer(props: DrawerProps) {
  const { open = false, placement = 'left', onClose, children } = props

  function onCloseDrawer() {
    onClose?.()
  }
  const transitionDirection = transitionDirectionMap[placement]

  return (
    <Transition show={open} appear as={Fragment}>
      <Dialog as="div" className="relative z-30" onClose={onCloseDrawer}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 h-full w-full">
          <Transition.Child
            as={Fragment}
            enter="transition ease-out duration-300 transform"
            enterFrom={transitionDirection}
            enterTo=""
            leave="transition ease-in duration-300 transform"
            leaveFrom=""
            leaveTo={transitionDirection}
          >
            <Dialog.Panel
              className={classNames(
                `${placement}-0`,
                props.classNames || '',
                'absolute flex h-full w-[35rem] flex-col drop-shadow-2xl transition-all duration-300 ease-out',
              )}
            >
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
