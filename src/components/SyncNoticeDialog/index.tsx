import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import IconCloudCheck from '~icons/tabler/cloud-check'
import IconX from '~icons/tabler/x'

export interface SyncNoticeInfo {
  dictId: string
  dictName: string
  latestChapter: number
  currentChapter: number
  syncedCount: number
}

interface SyncNoticeDialogProps {
  isOpen: boolean
  notice: SyncNoticeInfo | null
  onJump: (dictId: string, chapter: number) => void
  onDismiss: () => void
}

export default function SyncNoticeDialog({ isOpen, notice, onJump, onDismiss }: SyncNoticeDialogProps) {
  const { t } = useTranslation()
  const handleJump = useCallback(() => {
    if (notice) {
      onJump(notice.dictId, notice.latestChapter)
    }
    onDismiss()
  }, [notice, onJump, onDismiss])

  if (!notice) return null

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onDismiss}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-0 shadow-xl dark:bg-gray-800">
                <div className="relative flex items-center justify-between rounded-t-lg border-b border-neutral-100 bg-stone-50 px-6 py-3 dark:border-neutral-700 dark:bg-gray-900">
                  <span className="text-lg font-bold text-gray-600 dark:text-gray-300">{t('common.syncNotice.title')}</span>
                  <button type="button" onClick={onDismiss} title={t('common.syncNotice.close')}>
                    <IconX className="cursor-pointer text-gray-400" />
                  </button>
                </div>

                <div className="flex flex-col items-center gap-4 px-6 py-6">
                  <IconCloudCheck className="h-12 w-12 text-indigo-500" />

                  <div className="text-center">
                    <p className="text-base text-gray-700 dark:text-gray-200">
                      {t('common.syncNotice.syncedRecords', { count: notice.syncedCount })}
                    </p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {t('common.syncNotice.recentPractice', { dictName: notice.dictName, chapter: notice.latestChapter + 1 })}
                    </p>
                  </div>

                  <div className="mt-2 flex w-full gap-3">
                    <button
                      type="button"
                      onClick={onDismiss}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                    >
                      {t('common.syncNotice.stayCurrentChapter')}
                    </button>
                    <button
                      type="button"
                      onClick={handleJump}
                      className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                    >
                      {t('common.syncNotice.jumpToChapter', { chapter: notice.latestChapter + 1 })}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
