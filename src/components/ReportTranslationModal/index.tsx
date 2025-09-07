import type { ReportedWord } from '@/typings'
import { addReportedWord, getPendingReportedWordsCount } from '@/utils/reportedWords'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import IconClose from '~icons/tabler/x'

interface ReportTranslationModalProps {
  isOpen: boolean
  onClose: () => void
  word: string
  originalTranslation: string
  dictionary: string
  onReportSubmitted?: () => void
}

export default function ReportTranslationModal({
  isOpen,
  onClose,
  word,
  originalTranslation,
  dictionary,
  onReportSubmitted,
}: ReportTranslationModalProps) {
  const { t } = useTranslation()
  const [userCorrection, setUserCorrection] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setUserCorrection('')
      setIsSubmitting(false)
    }
  }, [isOpen])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!userCorrection.trim()) {
        return
      }

      setIsSubmitting(true)

      try {
        const reportedWord: ReportedWord = {
          word,
          originalTranslation,
          userCorrection: userCorrection.trim(),
          dictionary,
          timestamp: Date.now(),
        }

        addReportedWord(reportedWord)

        // Check if we've reached 10 words
        const pendingCount = getPendingReportedWordsCount()

        onClose()

        if (onReportSubmitted) {
          onReportSubmitted()
        }

        // Show success message or trigger 10-word modal if needed
        if (pendingCount >= 10) {
          // The parent component will handle showing the summary modal
        }
      } catch (error) {
        console.error('Error submitting word report:', error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [userCorrection, word, originalTranslation, dictionary, onClose, onReportSubmitted],
  )

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                {/* Close button */}
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-gray-200"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <IconClose className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                      {t('report.modal_title', 'Report Translation Issue')}
                    </Dialog.Title>

                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('report.word_label', 'Word')}
                        </label>
                        <div className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                          {word}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {t('report.current_translation_label', 'Current Translation')}
                        </label>
                        <div className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                          {originalTranslation}
                        </div>
                      </div>

                      <form onSubmit={handleSubmit}>
                        <div>
                          <label htmlFor="userCorrection" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('report.correct_translation_label', 'Correct Translation')}
                          </label>
                          <textarea
                            id="userCorrection"
                            name="userCorrection"
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-300 sm:text-sm"
                            placeholder={t('report.correction_placeholder', 'Enter the correct translation...')}
                            value={userCorrection}
                            onKeyDown={(e) => e.stopPropagation()}
                            onChange={(e) => setUserCorrection(e.target.value)}
                            required
                          />
                        </div>

                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                          <button
                            type="submit"
                            disabled={!userCorrection.trim() || isSubmitting}
                            className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:col-start-2 sm:text-sm"
                          >
                            {isSubmitting ? t('report.submitting', 'Submitting...') : t('report.submit_button', 'Submit Report')}
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 sm:col-start-1 sm:mt-0 sm:text-sm"
                            onClick={onClose}
                          >
                            {t('report.cancel_button', 'Cancel')}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
