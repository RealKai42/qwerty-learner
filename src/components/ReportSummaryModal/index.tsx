import type { ReportedWord } from '@/typings'
import { generateReportUrl, submitPendingWords } from '@/utils/reportedWords'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import IconCheck from '~icons/tabler/check'
import IconExternalLink from '~icons/tabler/external-link'
import IconClose from '~icons/tabler/x'

interface ReportSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  reportedWords: ReportedWord[]
}

export default function ReportSummaryModal({ isOpen, onClose, reportedWords }: ReportSummaryModalProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleReportToMaintainer = useCallback(async () => {
    setIsSubmitting(true)

    try {
      // Submit the pending words and get the submitted words
      const submittedWords = submitPendingWords()

      // Generate the Google Forms URL with pre-filled data
      const reportUrl = generateReportUrl(submittedWords)

      // Open the Google Forms in a new tab
      window.open(reportUrl, '_blank', 'noopener,noreferrer')

      setIsSubmitted(true)

      // Close modal after a short delay
      setTimeout(() => {
        onClose()
        setIsSubmitted(false)
      }, 2000)
    } catch (error) {
      console.error('Error submitting report:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [onClose])

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose()
      setIsSubmitted(false)
    }
  }, [isSubmitting, onClose])

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                {/* Close button */}
                {!isSubmitting && (
                  <div className="absolute right-0 top-0 pr-4 pt-4">
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:hover:text-gray-200"
                      onClick={handleClose}
                    >
                      <span className="sr-only">Close</span>
                      <IconClose className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                )}

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                    {!isSubmitted ? (
                      <>
                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                          {t('report.summary_title', 'Ready to Report Translation Issues')}
                        </Dialog.Title>

                        <div className="mt-4">
                          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                            {t(
                              'report.summary_description',
                              'You have reported {{count}} translation issues. Review them below and submit to the maintainer.',
                              { count: reportedWords.length },
                            )}
                          </p>

                          <div className="max-h-64 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-600">
                            <div className="divide-y divide-gray-200 dark:divide-gray-600">
                              {reportedWords.map((word, index) => (
                                <div key={index} className="p-3 text-sm">
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {word.word} ({word.dictionary})
                                  </div>
                                  <div className="mt-1 text-gray-600 dark:text-gray-300">
                                    <span className="line-through">{word.originalTranslation}</span>
                                    {' → '}
                                    <span className="font-medium text-green-600 dark:text-green-400">{word.userCorrection}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                          <button
                            type="button"
                            onClick={handleReportToMaintainer}
                            disabled={isSubmitting}
                            className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:col-start-2 sm:text-sm"
                          >
                            {isSubmitting ? (
                              t('report.submitting', 'Submitting...')
                            ) : (
                              <>
                                <IconExternalLink className="mr-2 h-4 w-4" />
                                {t('report.report_to_maintainer', 'Report to Maintainer')}
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 sm:col-start-1 sm:mt-0 sm:text-sm"
                            onClick={handleClose}
                            disabled={isSubmitting}
                          >
                            {t('report.cancel_button', 'Cancel')}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                          <IconCheck className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
                        </div>
                        <div className="mt-3">
                          <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                            {t('report.success_title', 'Report Submitted!')}
                          </Dialog.Title>
                          <div className="mt-2">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {t(
                                'report.success_message',
                                'Thank you for helping improve the translations. The Google Form should have opened in a new tab.',
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
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
