import { Platform } from '../libs/platform'

export function useFastScreenshot() {
  const supportFastScreenshot = Platform.OS === 'web'
  return [supportFastScreenshot]
}
