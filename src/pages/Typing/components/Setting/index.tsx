import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Dialog, Switch, Tab, Transition } from '@headlessui/react'
import classNames from 'classnames'
import { Fragment, useCallback, useState } from 'react'
import * as Slider from '@radix-ui/react-slider'
import { useAtom } from 'jotai'
import { hintSoundsConfigAtom, keySoundsConfigAtom, pronunciationConfigAtom } from '@/store'
import styles from './index.module.css'

export default function Setting() {
  const [isOpen, setIsOpen] = useState(false)
  const [pronunciationConfig, setPronunciationConfig] = useAtom(pronunciationConfigAtom)
  const [keySoundsConfig, setKeySoundsConfig] = useAtom(keySoundsConfigAtom)
  const [hintSoundsConfig, setHintSoundsConfig] = useAtom(hintSoundsConfigAtom)

  const onTogglePronunciation = useCallback(
    (checked: boolean) => {
      setPronunciationConfig((prev) => ({
        ...prev,
        isOpen: checked,
      }))
    },
    [setPronunciationConfig],
  )
  const onChangePronunciationVolume = useCallback(
    (value: [number]) => {
      setPronunciationConfig((prev) => ({
        ...prev,
        volume: value[0] / 100,
      }))
    },
    [setPronunciationConfig],
  )

  const onToggleKeySounds = useCallback(
    (checked: boolean) => {
      setKeySoundsConfig((prev) => ({
        ...prev,
        isOpen: checked,
      }))
    },
    [setKeySoundsConfig],
  )
  const onChangeKeySoundsVolume = useCallback(
    (value: [number]) => {
      setKeySoundsConfig((prev) => ({
        ...prev,
        volume: value[0] / 100,
      }))
    },
    [setKeySoundsConfig],
  )

  const onToggleHintSounds = useCallback(
    (checked: boolean) => {
      setHintSoundsConfig((prev) => ({
        ...prev,
        isOpen: checked,
      }))
    },
    [setHintSoundsConfig],
  )
  const onChangeHintSoundsVolume = useCallback(
    (value: [number]) => {
      setHintSoundsConfig((prev) => ({
        ...prev,
        volume: value[0] / 100,
      }))
    },
    [setHintSoundsConfig],
  )

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className={`flex items-center justify-center rounded p-[2px] py-[3px] text-lg text-indigo-400 outline-none transition-colors duration-300 ease-in-out hover:bg-indigo-400 hover:text-white  ${
          isOpen ? 'bg-indigo-400 text-white' : ''
        }`}
      >
        <FontAwesomeIcon icon="gear" fixedWidth className="focus:outline-none" />
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
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

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="flex w-200 flex-col overflow-hidden rounded-2xl bg-white p-0 shadow-xl">
                  <div className="relative flex h-22 items-end justify-between rounded-t-lg border-b border-neutral-200 bg-stone-50 px-6 py-3">
                    <span className="text-3xl font-bold text-gray-700">设置</span>
                    <FontAwesomeIcon
                      icon={['fas', 'times']}
                      className="absolute right-7 top-5 cursor-pointer text-gray-400"
                      size="lg"
                      onClick={() => setIsOpen(false)}
                    />
                  </div>

                  <Tab.Group vertical>
                    <div className="flex h-120 w-full ">
                      <Tab.List className="flex h-full w-52 flex-col items-start space-y-3 border-r border-neutral-200 bg-stone-50 px-6 py-3">
                        <Tab
                          className={({ selected }) =>
                            classNames(
                              'flex h-14 w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-2 ring-0 focus:outline-none',
                              selected && 'bg-gray-200 bg-opacity-50',
                            )
                          }
                        >
                          <FontAwesomeIcon icon="ear-listen" className="mr-2" size="1x" />
                          <span className="text-neutral-500">音效设置</span>
                        </Tab>
                        <Tab
                          className={({ selected }) =>
                            classNames(
                              'flex h-14 w-full cursor-pointer items-center gap-2 rounded-lg px-4 py-2 ring-0 focus:outline-none',
                              selected && 'bg-gray-200 bg-opacity-50',
                            )
                          }
                        >
                          <FontAwesomeIcon icon="sliders" className="mr-2" size="1x" />
                          <span className="text-neutral-500">高级设置</span>
                        </Tab>
                      </Tab.List>

                      <Tab.Panels className="h-full w-full flex-1">
                        <Tab.Panel className="flex h-full w-full  focus:outline-none">
                          <div className="flex w-full flex-col items-start justify-start gap-10 overflow-y-auto pb-40 pl-6 pr-9 pt-8">
                            <div className={styles.section}>
                              <span className={styles.sectionLabel}>单词发音</span>
                              <div className={styles.switchBlock}>
                                <Switch checked={pronunciationConfig.isOpen} onChange={onTogglePronunciation} className="switch-root">
                                  <span aria-hidden="true" className="switch-thumb" />
                                </Switch>
                                <span className="text-right text-xs font-normal leading-tight text-gray-600">{`发音已${
                                  pronunciationConfig.isOpen ? '开启' : '关闭'
                                }`}</span>
                              </div>
                              <div className={styles.block}>
                                <span className={styles.blockLabel}>音量</span>
                                <div className="flex h-5 w-full items-center justify-between">
                                  <Slider.Root
                                    defaultValue={[pronunciationConfig.volume * 100]}
                                    max={100}
                                    step={10}
                                    className="slider"
                                    onValueChange={onChangePronunciationVolume}
                                  >
                                    <Slider.Track>
                                      <Slider.Range />
                                    </Slider.Track>
                                    <Slider.Thumb />
                                  </Slider.Root>
                                  <span className="ml-4 w-10 text-xs font-normal text-gray-800">{`${Math.floor(
                                    pronunciationConfig.volume * 100,
                                  )}%`}</span>
                                </div>
                              </div>
                            </div>

                            <div className={styles.section}>
                              <span className={styles.sectionLabel}>按键音</span>
                              <div className={styles.switchBlock}>
                                <Switch checked={keySoundsConfig.isOpen} onChange={onToggleKeySounds} className="switch-root">
                                  <span aria-hidden="true" className="switch-thumb" />
                                </Switch>
                                <span className="text-right text-xs font-normal leading-tight text-gray-600">{`发音已${
                                  keySoundsConfig.isOpen ? '开启' : '关闭'
                                }`}</span>
                              </div>
                              <div className={styles.block}>
                                <span className="font-medium text-gray-800">音量</span>
                                <div className="flex h-5 w-full items-center justify-between">
                                  <Slider.Root
                                    defaultValue={[keySoundsConfig.volume * 100]}
                                    max={100}
                                    step={10}
                                    className="slider"
                                    onValueChange={onChangeKeySoundsVolume}
                                  >
                                    <Slider.Track>
                                      <Slider.Range />
                                    </Slider.Track>
                                    <Slider.Thumb />
                                  </Slider.Root>
                                  <span className="ml-4 w-10 text-xs font-normal text-gray-800">{`${Math.floor(
                                    keySoundsConfig.volume * 100,
                                  )}%`}</span>
                                </div>
                              </div>
                            </div>

                            <div className={styles.section}>
                              <span className={styles.sectionLabel}>效果音</span>
                              <div className={styles.switchBlock}>
                                <Switch checked={hintSoundsConfig.isOpen} onChange={onToggleHintSounds} className="switch-root">
                                  <span aria-hidden="true" className="switch-thumb" />
                                </Switch>
                                <span className="text-right text-xs font-normal leading-tight text-gray-600">{`发音已${
                                  hintSoundsConfig.isOpen ? '开启' : '关闭'
                                }`}</span>
                              </div>
                              <div className={styles.block}>
                                <span className="font-medium text-gray-800">音量</span>
                                <div className="flex h-5 w-full items-center justify-between">
                                  <Slider.Root
                                    defaultValue={[hintSoundsConfig.volume * 100]}
                                    max={100}
                                    step={10}
                                    className="slider"
                                    onValueChange={onChangeHintSoundsVolume}
                                  >
                                    <Slider.Track>
                                      <Slider.Range />
                                    </Slider.Track>
                                    <Slider.Thumb />
                                  </Slider.Root>
                                  <span className="ml-4 w-10 text-xs font-normal text-gray-800">{`${Math.floor(
                                    hintSoundsConfig.volume * 100,
                                  )}%`}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Tab.Panel>
                        <Tab.Panel className="h-full w-full px-6 py-3 focus:outline-none">
                          <h1>账号设置2</h1>
                        </Tab.Panel>
                      </Tab.Panels>
                    </div>
                  </Tab.Group>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
