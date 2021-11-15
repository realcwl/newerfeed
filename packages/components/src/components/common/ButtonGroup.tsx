import React from 'react'
import { StyleSheet, View } from 'react-native'

import { sharedStyles } from '../../styles/shared'
import { scaleFactor } from '../../styles/variables'
import { Button } from './Button'

interface Data {
  id: string
  name: string
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 28 * scaleFactor,
    height: 28 * scaleFactor,
  },
  text: {
    fontWeight: '500',
  },
})

export interface ButtonGroupProps {
  data: Data[]
  onPress?: (id: string) => {}
}

export const ButtonGroup = (props: ButtonGroupProps) => {
  const { data, onPress } = props
  const handleOnPress = (id: string) => () => {
    if (onPress) {
      onPress(id)
    }
  }
  const buttons = data.map(
    ({ id, name }) =>
      id !== '' &&
      name !== '' && (
        <Button
          key={id}
          type="neutral"
          style={[
            sharedStyles.marginVerticalQuarter,
            sharedStyles.marginRightHalf,
            styles.wrapper,
          ]}
          textStyle={styles.text}
          onPress={handleOnPress(id)}
        >
          {name}
        </Button>
      ),
  )
  return (
    <View
      style={[
        sharedStyles.horizontal,
        sharedStyles.marginVerticalQuarter,
        sharedStyles.flexWrap,
      ]}
    >
      {buttons}
    </View>
  )
}
