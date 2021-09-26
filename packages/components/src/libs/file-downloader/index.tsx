import { Attachment } from '@devhub/core'
import React from 'react'
import ReactNativeImageViewer from 'react-native-image-zoom-viewer'
import { Modal } from 'react-native'
import { Button } from '../../components/common/Button'

export type Prop = {
  file: Attachment
}

const FileDownloader = ({ file }: Prop) => <Button>test</Button>
export default FileDownloader
