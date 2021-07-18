import React from 'react'
import { View, StyleSheet } from 'react-native-web'
import { Button } from '../../common/Button'
import { sharedStyles } from '../../../styles/shared'
import { ThemeColors } from '@devhub/core'
import { scaleFactor } from '../../../styles/variables'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export interface LogicalExpressionButtonsProps {}

export function renderButtonByTextAndKey(
  text: string,
  color: keyof ThemeColors,
  disabled = false,
) {
  return (
    <View style={sharedStyles.paddingHorizontal}>
      <Button
        analyticsLabel="add_or_set_column"
        colors={{
          backgroundHoverThemeColor: color,
          backgroundThemeColor: color,
          foregroundThemeColor: 'black',
          foregroundHoverThemeColor: 'black',
        }}
        disabled={disabled}
        onPress={() => console.log('press button')}
        size={30 * scaleFactor}
      >
        {text}
      </Button>
    </View>
  )
}

export const LogicalExpressionButtons = React.memo(
  (props: LogicalExpressionButtonsProps) => {
    return (
      <View style={[sharedStyles.flex, sharedStyles.horizontal]}>
        <View style={styles.container}>
          {renderButtonByTextAndKey('AllOf', 'yellow')}
        </View>
        <View style={styles.container}>
          {renderButtonByTextAndKey('AnyOf', 'green')}
        </View>
        <View style={styles.container}>
          {renderButtonByTextAndKey('Not', 'red')}
        </View>
      </View>
    )
  },
)
