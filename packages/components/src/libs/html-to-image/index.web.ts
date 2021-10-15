import { toBlob } from 'html-to-image'

const UNSUPPORTED_MSG = '该浏览器不支持剪切板接口，请考虑使用Chrome'
const DEFAULT_BACKGROUND_COLOR = '#FFFFFF'
const DEFAULT_BLOB_TYPE = 'image/png'

const isSafari = () =>
  navigator.vendor.match(/apple/i) &&
  !navigator.userAgent.match(/crios/i) &&
  !navigator.userAgent.match(/fxios/i) &&
  !navigator.userAgent.match(/Opera|OPT\//)

const getImageBlobFromRef = async (
  ref: any,
  backgroundColor: string,
): Promise<Blob> => {
  const blob = await toBlob(ref.current as HTMLElement, {
    cacheBust: true,
    backgroundColor: backgroundColor || DEFAULT_BACKGROUND_COLOR,
  })
  if (blob) {
    return blob
  }
  return new Blob()
}

const getTypeFromBlob = (blob: Blob | null): string => {
  return (blob && blob.type) || DEFAULT_BLOB_TYPE
}

export const saveViewToClipboard = async (
  ref: any,
  backgroundColor: string,
) => {
  if (ref.current) {
    try {
      const clipboard = window?.navigator?.clipboard
      if (clipboard != null && clipboard.write) {
        if (isSafari()) {
          await clipboard.write([
            new ClipboardItem({
              'image/png': getImageBlobFromRef(ref, backgroundColor),
            }),
          ])
          console.log('Copied')
        } else {
          const blob = await getImageBlobFromRef(ref, backgroundColor)
          await clipboard.write([new ClipboardItem({ [blob.type]: blob })])
          console.log('Copied')
        }
      } else {
        console.error(
          'window.navigator.clipboard is not supported in this browser',
        )
        throw new Error(UNSUPPORTED_MSG)
      }
    } catch (e) {
      throw new Error(UNSUPPORTED_MSG)
    }
  } else {
    console.error('invalid ref.current')
  }
}
