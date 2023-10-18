import { AmountImageMap } from './AmountQrMap'
import { Amount } from './components/Amount'
import { useEffect, useState } from 'react'

export type AmountType = -1 | 6 | 12 | 36 | 50 | 66
const displayAmount: AmountType[] = [6, 12, 36, 50, 66, -1]

export const DonatingCard = ({ className, onAmountChange }: { className?: string; onAmountChange?: (amount: AmountType) => void }) => {
  const [amount, setAmount] = useState<AmountType | undefined>(undefined)

  const onClickAmount = (amount: AmountType) => {
    setAmount(amount)
  }

  useEffect(() => {
    onAmountChange && amount && onAmountChange(amount as AmountType)
  }, [amount, onAmountChange])

  return (
    <div className={`flex w-full flex-col items-center justify-center gap-3 ${className && className}`}>
      <h2 className="self-start pl-10 font-bold text-gray-800 dark:text-gray-300">选择您的捐赠金额：</h2>
      <div className="mt-2 flex gap-3">
        {displayAmount.map((a) => {
          return <Amount active={a === amount} key={a} amount={a} onClick={onClickAmount} />
        })}
      </div>

      <div className={`mt-3 flex w-full  flex-col  overflow-hidden px-11 transition-[height] duration-500 ${amount ? 'h-44' : 'h-0'}`}>
        {amount && (
          <div className="flex w-full justify-between">
            <img src={AmountImageMap[amount][0]} alt="alipay" className=" h-44" />
            <img src={AmountImageMap[amount][1]} alt="weChat" className=" h-44" />
          </div>
        )}
      </div>
      {amount && (amount >= 50 || amount === -1) && (
        <span>
          <a
            className="text-sm font-bold text-gray-500 underline-offset-4 hover:underline dark:text-gray-400"
            href="https://wj.qq.com/s2/13329666/380d/"
            target="_blank"
            rel="noreferrer"
          >
            贴纸寄送地址问卷
          </a>
        </span>
      )}
    </div>
  )
}
