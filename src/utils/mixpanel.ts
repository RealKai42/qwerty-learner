import { InfoPanelType } from '@/typings'
import mixpanel from 'mixpanel-browser'

export type starAction = 'star' | 'dismiss'

export function recordStarAction(action: starAction) {
  const props = {
    action,
  }
  mixpanel.track('star', props)
}

export type openInfoPanelLocation = 'footer' | 'resultScreen'
export function recordOpenInfoPanelAction(type: InfoPanelType, location: openInfoPanelLocation) {
  const props = {
    type,
    location,
  }
  mixpanel.track('openInfoPanel', props)
}
