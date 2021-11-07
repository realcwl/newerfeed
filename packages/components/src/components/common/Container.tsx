import React from 'react'
import { StyleSheet, ViewStyle, View } from 'react-native'
import { sharedStyles } from '../../styles/shared'
import {
  screen_breakpoint_lg,
  screen_breakpoint_md,
  screen_breakpoint_sm,
  screen_breakpoint_xl,
} from '../../styles/variables'

export enum ScreenBreakpoints {
  sm = 'sm',
  md = 'md',
  lg = 'lg',
  xl = 'xl',
}

export interface ContainerProps {
  children: string | React.ReactNode
  breakpoint?: ScreenBreakpoints
  style?: ViewStyle
}

const BreakpointsMap = {
  [ScreenBreakpoints.sm]: screen_breakpoint_sm,
  [ScreenBreakpoints.md]: screen_breakpoint_md,
  [ScreenBreakpoints.lg]: screen_breakpoint_lg,
  [ScreenBreakpoints.xl]: screen_breakpoint_xl,
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
    overflow: 'scroll',
  },
})

/**
 * Container is to restrict the children to a certain width, default
 * to @ScreenBreakpoints.md (900px), set breakpoint to different
 * ScreenBreakpoints enums based on your usage.
 * @param props { children, breakpoint?, style?}
 * @returns Width-constrained Container with children
 */

export const Container = (props: ContainerProps) => {
  const { children, breakpoint, style } = props
  const maxWidthStyle = {
    maxWidth:
      (breakpoint && BreakpointsMap[breakpoint]) ||
      BreakpointsMap[ScreenBreakpoints.md],
  }
  return (
    <View
      style={[sharedStyles.fullWidth, styles.container, maxWidthStyle, style]}
    >
      {children}
    </View>
  )
}
