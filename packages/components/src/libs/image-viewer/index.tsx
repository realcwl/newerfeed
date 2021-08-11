import { Attachment } from '@devhub/core'
import React from 'react'
import ReactNativeImageViewer from 'react-native-image-zoom-viewer'
import { Modal } from 'react-native'

export type Prop = {
  image: Attachment | null
  setImage: (arg: Attachment | null) => void
}
const ImageViewer = ({ image, setImage }: Prop) => (
  <Modal visible={!!image}>
    <ReactNativeImageViewer
      imageUrls={[{ url: image?.url ?? '', props: {} }]}
      onSwipeDown={() => setImage(null)}
      onCancel={() => setImage(null)}
      enableSwipeDown={true}
    />
  </Modal>
)
export default ImageViewer
