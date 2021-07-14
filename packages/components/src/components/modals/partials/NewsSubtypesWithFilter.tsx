import { NewsFeedColumnSource, ThemeColors } from '@devhub/core'
import React, { useState } from 'react'
import { View } from 'react-native-web'
import { contentPadding } from '../../../styles/variables'
import { columnHeaderItemContentSize } from '../../columns/ColumnHeader'
import { sharedColumnOptionsStyles } from '../../columns/options/shared'
import { Checkbox } from '../../common/Checkbox'
import { Spacer } from '../../common/Spacer'
import {
  ThemedTextInput,
  ThemedTextInputProps,
} from '../../themed/ThemedTextInput'

// We shoud a search bar if there are more than 9 subtypes to be selected.
const MAX_ITEM_WITHOUT_FILTER = 9

export interface NewsSubtypesWithFilterProps {
  source: NewsFeedColumnSource
  formikProps: any
}

export const NewsSubtypesWithFilter = React.memo(
  (props: NewsSubtypesWithFilterProps) => {
    const { source, formikProps } = props

    // A string filter that will be changed by text input.
    const [filter, setFilter] = useState('')

    // Show error if all subtypes doesn't contain the specified text f
    function shouldShowError(source: NewsFeedColumnSource) {
      for (var subtype of source.subtypes) {
        if (subtype.includes(filter)) {
          return false
        }
      }
      return true
    }

    // Render a source filter that allows user to filter subtypes when there
    // are too many of them.
    function renderGenericFormTextInput<S extends NewsFeedColumnSource>(
      source: S,
      filter: string,
      setFilter: (filter: string) => void,
      required = true,
      textInputProps: Partial<ThemedTextInputProps> = {},
    ) {
      const errorColor = getErrorColor({ required })

      const defaultTextInputProps: Partial<ThemedTextInputProps> = {
        autoCapitalize: 'none',
        autoCorrect: false,
        autoFocus: false,
        blurOnSubmit: false,
        placeholder: 'Filter by name...',
      }

      return (
        <>
          <ThemedTextInput
            textInputKey={`add-column-details-text-input-${source.source}`}
            borderThemeColor={shouldShowError(source) ? errorColor : undefined}
            borderHoverThemeColor={
              shouldShowError(source) ? errorColor : undefined
            }
            borderFocusThemeColor={
              shouldShowError(source) ? errorColor : undefined
            }
            {...defaultTextInputProps}
            onChangeText={(value) => {
              setFilter(value)
            }}
            value={filter}
            {...textInputProps}
          />
          <Spacer height={contentPadding / 2} />
        </>
      )
    }

    function renderSourceSubtypes(
      source: NewsFeedColumnSource,
      filter: string,
    ) {
      return source.subtypes.map((subtype) => {
        const selectedSubtype = formikProps.values[source.source]
        return subtype.includes(filter) ? (
          <View key={`add-news-column-details-source-subtype-${subtype}`}>
            <Checkbox
              checked={selectedSubtype.includes(subtype)}
              containerStyle={
                sharedColumnOptionsStyles.fullWidthCheckboxContainer
              }
              defaultValue={false}
              label={subtype}
              onChange={(checked) => {
                if (selectedSubtype.includes(subtype)) {
                  let newlySelectedSubtypes = selectedSubtype.filter(
                    (name: string) => name !== subtype,
                  )
                  // formik 2.1.1 is required here, otherwise setting this field
                  // to empty array will mark this field as undefined.
                  // See the below issue for more context:
                  // https://github.com/formium/formik/issues/2130
                  formikProps.setFieldValue(
                    source.source,
                    newlySelectedSubtypes,
                  )
                } else {
                  formikProps.setFieldValue(source.source, [
                    ...selectedSubtype,
                    subtype,
                  ])
                }
                // formikProps.setFieldTouched(source.source)
              }}
              squareContainerStyle={
                sharedColumnOptionsStyles.checkboxSquareContainer
              }
            />
          </View>
        ) : null
      })
    }

    return (
      <View>
        {source.subtypes.length > MAX_ITEM_WITHOUT_FILTER
          ? renderGenericFormTextInput(source, filter, setFilter)
          : null}

        <View
          style={{
            marginLeft: columnHeaderItemContentSize + contentPadding / 2,
          }}
        >
          {renderSourceSubtypes(source, filter)}
        </View>
      </View>
    )
  },
)

function getErrorColor({
  required,
}: { required?: boolean } = {}): keyof ThemeColors {
  return required === false ? 'yellow' : 'lightRed'
}

NewsSubtypesWithFilter.displayName = 'NewsSubtypesWithFilter'
