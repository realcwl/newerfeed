import React, { useState } from 'react'
import { View, Modal } from 'react-native-web'
import { Prop } from './index'
import Lightbox from 'react-image-lightbox'
import 'react-image-lightbox/style.css'
import { Button } from '../../components/common/Button'
import { scaleFactor } from '../../styles/variables'
import { Octicons } from '../vector-icons'

const FileDownloaderWeb = ({ file }: Prop) => {
  const ext = file.name?.split('/')[file.name?.split('/').length - 1]
  return (
    <View style={{ marginBottom: 2 * scaleFactor, width: '100%' }}>
      <a href={file.url}>
        <Button
          round={false}
          type={'custom'}
          style={{
            width: '100%',
            whiteSpace: 'nowrap',
            height: 30 * scaleFactor,
          }}
          colors={{
            backgroundThemeColor: 'backgroundColorLess3',
            foregroundThemeColor: 'foregroundColor',
            backgroundHoverThemeColor: 'backgroundColorLess4',
            foregroundHoverThemeColor: 'foregroundColor',
          }}
          textStyle={{
            textAlign: 'left',
            overflow: 'hidden',
            fontWeight: '300',
            fontSize: 12,
            marginTop: -5 * scaleFactor,
          }}
          contentContainerStyle={{ alignItems: 'flex-start' }}
        >
          {`${ext === 'zip' || ext === 'rar' ? '📁' : '📄'} ${file.name}`}
        </Button>
      </a>
    </View>
  )
}

export default FileDownloaderWeb
