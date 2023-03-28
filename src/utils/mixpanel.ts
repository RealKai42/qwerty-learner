import { InfoPanelType } from '@/typings'
import mixpanel from 'mixpanel-browser'

export type starAction = 'star' | 'dismiss'

export function recordStarAction(action: starAction) {
  const props = {
    action,
  }
  mixpanel.track('star', props)
}

export function recordOpenInfoPanelAction(type: InfoPanelType) {
  const props = {
    type,
  }
  mixpanel.track('openInfoPanel', props)
}
