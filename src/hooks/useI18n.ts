import { useTranslation } from 'react-i18next'

const useI18n = () => {
  const { t } = useTranslation()
  const getI18n = (key: string, values?: Array<string>): string => {
    let i18nStr = t(key)
    if (values && values.length > 0) {
      values.forEach((item, index) => {
        i18nStr = i18nStr.replace('{' + index + '}', item)
      })
    }
    return i18nStr
  }

  return getI18n
}

export default useI18n
