import { useEffect } from 'react'

const Notifier = () => {
  useEffect(() => {
    if (!('Notification' in window)) {
      console.error('This browser does not support desktop notification')
    } else {
      Notification.requestPermission()
    }
  })
  return null
}

export default Notifier
