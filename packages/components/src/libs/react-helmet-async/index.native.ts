import React from 'react'

interface Props {
  children: string | React.ReactNode
}

export const Helmet = (props: Props): React.ReactNode => null
export const HelmetProvider = (props: Props): React.ReactNode => props.children
