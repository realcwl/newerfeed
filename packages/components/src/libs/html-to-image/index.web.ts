import { toBlob } from 'html-to-image'

const UNSUPPORTED_MSG =
  "This browser does't support view to clipboard, please use Chrome"
const INVALID_REF_MSG = 'Invalid view reference, please try again or refresh'
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
    // if cacheBust is true, it will add a random number to the end of image url
    // to force not using cache
    cacheBust: true,
    backgroundColor: backgroundColor || DEFAULT_BACKGROUND_COLOR,
  })
  if (blob) {
    return blob
  }
  return new Blob()
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
              [DEFAULT_BLOB_TYPE]: getImageBlobFromRef(ref, backgroundColor),
            }),
          ])
        } else {
          const blob = await getImageBlobFromRef(ref, backgroundColor)
          await clipboard.write([new ClipboardItem({ [blob.type]: blob })])
        }
      } else {
        throw new Error(UNSUPPORTED_MSG)
      }
    } catch (e) {
      throw new Error(UNSUPPORTED_MSG)
    }
  } else {
    throw new Error(INVALID_REF_MSG)
  }
}
