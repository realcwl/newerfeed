import React, { useState } from 'react'
import { View, Modal, Button } from 'react-native-web'
import { Prop } from './index'
import Lightbox from 'react-image-lightbox'
import 'react-image-lightbox/style.css'

const ImageViewerWeb = ({ images, index, setIndex }: Prop) => {
  return (
    <View>
      {!!images && index >= 0 && (
        <Lightbox
          mainSrc={images[index].url}
          nextSrc={images[(index + 1) % images.length].url}
          prevSrc={images[(index + images.length - 1) % images.length].url}
          onCloseRequest={() => setIndex(-1)}
          onMovePrevRequest={() =>
            setIndex((index + images.length - 1) % images.length)
          }
          onMoveNextRequest={() => setIndex((index + 1) % images.length)}
        />
      )}
    </View>
  )
}

export default ImageViewerWeb
