import React, { useCallback, useContext, useState } from 'react'

/**
 * Place global app settings here.
 */
export type AppSettings = {
  sound: boolean
}

export type AppSettingsContextData = {
  settings: AppSettings
  dispatch: (settings: AppSettings) => void
}

const AppSettingsContext = React.createContext<AppSettingsContextData>({} as AppSettingsContextData)

export function useAppSettings(): AppSettings {
  const { settings } = useContext(AppSettingsContext)
  return settings
}

export function useSoundState(): [status: boolean, toggle: () => void] {
  const { settings, dispatch } = useContext(AppSettingsContext)
  const toggleSound = useCallback(() => dispatch({ ...settings, sound: !settings.sound }), [settings, dispatch])
  return [settings.sound, toggleSound]
}

const defaultSettings: AppSettings = {
  sound: true,
}

export const AppSettingsProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  return <AppSettingsContext.Provider value={{ settings, dispatch: setSettings }}>{children}</AppSettingsContext.Provider>
}
