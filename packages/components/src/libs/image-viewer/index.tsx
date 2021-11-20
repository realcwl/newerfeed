import { Attachment } from '@devhub/core'
import React from 'react'
import ReactNativeImageViewer from 'react-native-image-zoom-viewer'
import { Modal } from 'react-native'

export type Prop = {
  images: Attachment[] | undefined
  index: number
  setIndex: (arg: number) => void
}
const ImageViewer = ({ images, index, setIndex }: Prop) => (
  <Modal visible={!!images && index >= 0}>
    <ReactNativeImageViewer
      imageUrls={images?.map((image) => {
        return { url: image.url, props: {} }
      })}
      index={index}
      onClick={() => setIndex(-1)}
      onSwipeDown={() => setIndex(-1)}
      onCancel={() => setIndex(-1)}
      enableSwipeDown={true}
      enablePreload={true}
      swipeDownThreshold={50}
    />
  </Modal>
)
export default ImageViewer
