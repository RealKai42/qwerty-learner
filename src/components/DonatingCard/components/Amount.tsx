import type { AmountType } from '..'

export const Amount = ({
  amount,
  onClick,
  active = true,
}: {
  amount: AmountType
  onClick?: (amount: AmountType) => void
  active: boolean
}) => {
  return (
    <button
      className={` focus:  h-10 rounded border-gray-100 font-bold text-gray-700 shadow-md shadow-gray-300
 outline-none hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:text-opacity-80 dark:opacity-80 
 dark:shadow-gray-700 hover:dark:bg-gray-600
 ${amount === -1 ? 'w-18' : 'w-10'} ${active ? 'bg-stone-100 dark:bg-gray-500' : ''}`}
      onClick={() => onClick && onClick(amount)}
    >
      {amount === -1 ? '自定义' : amount}
    </button>
  )
}
