import { toPng } from 'html-to-image'

const UNSUPPORTED_MSG = 'Feature not supported for native platform'

export const saveViewToClipboard = (ref: any, backgroundColor: string) => {
  throw new Error(UNSUPPORTED_MSG)
}
