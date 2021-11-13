import { Attachment } from '@devhub/core'
import React from 'react'
import { Button } from '../../components/common/Button'
import { downloadFile, DownloadFileOptions } from 'react-native-fs'

export type Prop = {
  file: Attachment
}

const download = async (file: Attachment): Promise<any> => {
  //Define path to store file along with the extension
  const path = `${file.name}`
  //Define options
  const options: DownloadFileOptions = {
    fromUrl: encodeURI(file.url),
    toFile: path,
  }

  //Call downloadFile
  const res = await downloadFile(options).promise
  if (res && res.statusCode === 200 && res.bytesWritten > 0) {
    console.log(res)
  } else {
    // TODO(fange): res code is 200 but bytesWritten is 0
    console.log('file download filed', res)
  }
}

const FileDownloader = ({ file }: Prop) => (
  <Button onPress={() => download(file)}>{file.name}</Button>
)
export default FileDownloader
