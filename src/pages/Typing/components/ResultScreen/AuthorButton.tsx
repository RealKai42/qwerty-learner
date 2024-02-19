import kai from '@/assets/kai.jpg'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export const AuthorButton = () => {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip defaultOpen>
        <TooltipTrigger>
          <Avatar className="h-8 w-8 shadow-lg" onClick={() => window.open('https://kaiyi.cool', '_blank')}>
            <AvatarImage src={kai} alt="Kai Homepage" />
            <AvatarFallback>Kai</AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent className="cursor-pointer" onClick={() => window.open('https://kaiyi.cool', '_blank')}>
          <p>点击了解作者和更多作品 ❤️</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
