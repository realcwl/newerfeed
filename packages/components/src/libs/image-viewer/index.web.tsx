import { Attachment } from '@devhub/core'
import React, { useState } from 'react'
import { TouchableWithoutFeedback, View, Image, Modal } from 'react-native-web'

export default (
  image: Attachment,
  setImage: (_: Attachment | null) => void,
) => {
  return (
    <Modal>
      <TouchableWithoutFeedback
        onPressOut={() => {
          setImage(null)
        }}
      >
        <View
          style={{
            marginTop: 200,
            width: '100%',
            height: '100%',
            alignItems: 'center',
          }}
          onTouchEnd={() => setImage(null)}
        >
          <Image
            source={{
              uri: image.url,
            }}
            key={image.id}
            style={{ height: 500, width: 500, resizeMode: 'contain' }}
          />
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}
