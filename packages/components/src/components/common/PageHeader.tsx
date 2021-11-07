import React from 'react'
import { ThemedTouchableOpacityProps } from '../themed/ThemedTouchableOpacity'
import { StyleSheet } from 'react-native'
import { ThemedText, ThemedTextProps } from '../themed/ThemedText'
import { sharedStyles } from '../../styles/shared'
import { contentPadding, extraLargeTextSize } from '../../styles/variables'
import { ThemedView } from '../themed/ThemedView'
import { Container } from './Container'

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: contentPadding,
    flexDirection: 'row',
  },
  text: {
    flexGrow: 1,
    fontWeight: '500',
    fontSize: extraLargeTextSize,
    textAlign: 'center',
  },
  innerContainer: {
    paddingLeft: contentPadding,
    paddingRight: contentPadding,
  },
})

interface PageHeaderProps extends ThemedTouchableOpacityProps {
  TextColor?: ThemedTextProps['color']
  textStyle?: ThemedTextProps['style']
  title: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function PageHeader(props: PageHeaderProps) {
  const { TextColor, textStyle, title, leftIcon, rightIcon } = props
  return (
    <ThemedView
      backgroundColor="primaryBackgroundColor"
      style={[sharedStyles.fullWidth, styles.container]}
    >
      <Container style={styles.innerContainer}>
        {leftIcon}
        <ThemedText
          color={TextColor || 'foregroundColor'}
          style={[styles.text, textStyle]}
        >
          {title}
        </ThemedText>
        {rightIcon}
      </Container>
    </ThemedView>
  )
}
