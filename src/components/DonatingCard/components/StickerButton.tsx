import sticker2 from '@/assets/sticker2.jpg'
import sticker1 from '@/assets/sticker.jpg'
import { Tooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import IconInfo from '~icons/ic/outline-info'
import SolarStickerSmileSquareOutline from '~icons/solar/sticker-smile-square-outline'

export const StickerButton = ({ className }: { className?: string }) => {
  return (
    <>
      <div
        data-tooltip-id="sticker-btn"
        className={`w-max cursor-pointer rounded border-2 border-dashed border-gray-300 p-1.5 indent-0 text-sm font-bold text-gray-500 transition-all hover:border-indigo-500 hover:text-indigo-500
        dark:text-gray-300
        ${className}`}
      >
        <SolarStickerSmileSquareOutline className="mb-[2px] mr-2 inline-block text-sm " />
        查看贴纸
      </div>
      <Tooltip
        id="sticker-btn"
        opacity={1}
        className="flex flex-col items-center justify-center gap-2 rounded-lg !bg-gray-100 !p-4 shadow-lg shadow-gray-300 
        dark:!bg-gray-800 dark:text-gray-300 dark:shadow-lg dark:shadow-gray-700"
      >
        <div className="flex gap-2">
          <img src={sticker1} alt="sticker1" className="h-36 rounded shadow-lg shadow-gray-300 dark:shadow-gray-700" />
          <img src={sticker2} alt="sticker2" className="h-36 rounded shadow-lg shadow-gray-300 dark:shadow-gray-700" />
        </div>
        <span className="mt-2 flex flex-col items-center justify-center text-xs font-bold text-gray-500 sm:flex-row">
          <IconInfo className="mb-[3px] mr-1" />
          <span>此贴纸非商品，仅用于感谢您的捐赠，不可用于任何商业用途</span>
        </span>
      </Tooltip>
    </>
  )
}
