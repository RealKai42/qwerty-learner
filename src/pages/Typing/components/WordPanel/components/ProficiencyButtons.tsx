import Tooltip from '@/components/Tooltip'
import { Button } from '@/components/ui/button'
import { useSaveWordProficiency } from '@/utils/db'
import { Check, Clock } from 'lucide-react'
import { useCallback, useState } from 'react'

interface ProficiencyButtonsProps {
  word: string
  onMarkProficiency?: (status: 'known' | 'remembered') => void
  className?: string
}

/**
 * 显示单词熟练度标记按钮
 */
export default function ProficiencyButtons({ word, onMarkProficiency, className = '' }: ProficiencyButtonsProps) {
  const saveWordProficiency = useSaveWordProficiency()
  const [isLoading, setIsLoading] = useState(false)

  const handleMarkWord = useCallback(
    async (status: 'known' | 'remembered') => {
      if (isLoading) return

      setIsLoading(true)
      try {
        await saveWordProficiency({ word, status })
        onMarkProficiency?.(status)
      } finally {
        setIsLoading(false)
      }
    },
    [word, saveWordProficiency, onMarkProficiency, isLoading],
  )

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Tooltip content="标记为熟知（永不出现）">
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 rounded-full p-2 transition-colors hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900 dark:hover:text-green-400"
          onClick={() => handleMarkWord('known')}
          disabled={isLoading}
        >
          <Check size={20} className="text-green-500" />
        </Button>
      </Tooltip>

      <Tooltip content="标记为记得（暂时不出现）">
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 rounded-full p-2 transition-colors hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900 dark:hover:text-blue-400"
          onClick={() => handleMarkWord('remembered')}
          disabled={isLoading}
        >
          <Clock size={20} className="text-blue-500" />
        </Button>
      </Tooltip>
    </div>
  )
}
