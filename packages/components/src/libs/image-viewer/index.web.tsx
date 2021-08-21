import React, { useState } from 'react'
import { View, Modal, Button } from 'react-native-web'
import { Prop } from './index'
import Lightbox from 'react-image-lightbox'
import 'react-image-lightbox/style.css'

const ImageViewerWeb = ({ image, setImage }: Prop) => {
  return (
    <View>
      {!!image && (
        <Lightbox
          mainSrc={image?.url ?? ''}
          onCloseRequest={() => setImage(null)}
        />
      )}
    </View>
  )
}

export default ImageViewerWeb
