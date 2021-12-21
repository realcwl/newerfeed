import React, { useState } from 'react'
import { View } from 'react-native'
import { useFormik } from 'formik'

import {
  mapSourceIdToName,
  NewsFeedColumnSource,
  ThemeColors,
  SourceOrSubSource,
  constants,
  mapSourceIdToExternalId,
} from '@devhub/core'

import { sharedStyles } from '../../../styles/shared'
import {
  contentPadding,
  scaleFactor,
  smallTextSize,
} from '../../../styles/variables'
import { useReduxState } from '../../../hooks/use-redux-state'
import { columnHeaderItemContentSize } from '../../columns/ColumnHeader'
import * as actions from '../../../redux/actions'
import { sharedColumnOptionsStyles } from '../../columns/options/shared'
import { Checkbox } from '../../common/Checkbox'
import * as selectors from '../../../redux/selectors'
import { Spacer } from '../../common/Spacer'
import {
  ThemedTextInput,
  ThemedTextInputProps,
} from '../../themed/ThemedTextInput'
import { ThemedText } from '../../themed/ThemedText'
import { Separator } from '../../common/Separator'
import { SELECT_ALL } from '../../../resources/strings'
import { useColumnCreatedByCurrentUser } from '../../../hooks/use-column-created-by-current-user'
import { TagToken } from '../../common/TagToken'
import { useDispatch } from 'react-redux'
import { Text } from '../../common/Text'
import { useTheme } from '../../context/ThemeContext'
// We shoud a search bar if there are more than 9 subtypes to be selected.
const MAX_ITEM_WITHOUT_FILTER = 9
const MINIMUM_SUBTYPES_SIZE_FOR_SORTING = 15

export interface NewsSubtypesWithFilterProps {
  source: NewsFeedColumnSource
  formikProps: ReturnType<typeof useFormik>
  editable: boolean
}

export const NewsSubtypesWithFilter = React.memo(
  (props: NewsSubtypesWithFilterProps) => {
    const { source, formikProps, editable } = props
    const idToSourceOrSubSourceMap = useReduxState(
      selectors.idToSourceOrSubSourceMapSelector,
    )
    const sourceState = idToSourceOrSubSourceMap[source.sourceId].state
    const theme = useTheme()
    // A string filter that will be changed by text input.
    const [filter, setFilter] = useState('')
    const dispatch = useDispatch()

    // Show error if all subtypes doesn't contain the specified text f
    function shouldShowError(source: NewsFeedColumnSource) {
      for (const subtype of source.subSourceIds) {
        if (
          mapSourceIdToName(subtype, idToSourceOrSubSourceMap).includes(filter)
        ) {
          return false
        }
      }
      return true
    }

    function renderAddButton(onPress?: () => void, sourceState?: string) {
      const errorColor = getErrorColor({ required: true })
      return (
        <View
          key={`filter-tag-text`}
          style={sharedStyles.horizontalAndVerticallyAligned}
        >
          <TagToken
            label="+"
            onPress={() => {
              if (!onPress) return
              onPress()
            }}
            size={25 * scaleFactor}
            disabled={sourceState == 'loading'}
          />
          {sourceState == 'error' && (
            <Text
              numberOfLines={1}
              style={[
                {
                  fontSize: smallTextSize,
                  color: theme.red,
                  marginLeft: contentPadding,
                },
              ]}
            >
              {"can't add " + filter}
            </Text>
          )}
        </View>
      )
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
        placeholder: isSourceOpenToAddSubsource(
          source.sourceId,
          idToSourceOrSubSourceMap,
        )
          ? 'Filter or Add by name...'
          : 'Filter by name...',
      }

      return (
        <>
          <ThemedTextInput
            textInputKey={`add-column-details-text-input-${source.sourceId}`}
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
              dispatch(
                actions.addSubsourceTerminate({ sourceId: source.sourceId }),
              )
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
      const selectedSubtypes: string[] = formikProps.values[source.sourceId]
      let selectedFilteredSubSourcesCount = 0
      const filteredSubSources: string[] = source.subSourceIds.filter(
        (subType: string) => {
          // Either name match or external id match (used for Twitter)
          const show =
            mapSourceIdToName(subType, idToSourceOrSubSourceMap).includes(
              filter,
            ) ||
            mapSourceIdToExternalId(subType, idToSourceOrSubSourceMap).includes(
              filter,
            )
          if (show && selectedSubtypes.includes(subType)) {
            selectedFilteredSubSourcesCount++
          }
          return show
        },
      )
      const allSelected =
        selectedFilteredSubSourcesCount === filteredSubSources.length

      // Select all button to select/unselect current all filtered subSources
      const renderSelectAll = () => {
        if (filteredSubSources.length > 1 && editable) {
          const selectAllText = (
            <ThemedText
              color="foregroundColorMuted65"
              numberOfLines={1}
              style={{ fontWeight: 'bold' }}
            >
              {SELECT_ALL}
            </ThemedText>
          )

          return (
            <View style={{ marginRight: 24 }}>
              <Checkbox
                checked={allSelected}
                containerStyle={
                  sharedColumnOptionsStyles.fullWidthCheckboxContainer
                }
                defaultValue={false}
                label={selectAllText}
                onChange={(checked) => {
                  if (checked) {
                    let newSelectedSubSources

                    if (filter == null || filter === '') {
                      newSelectedSubSources = source.subSourceIds
                    } else {
                      newSelectedSubSources = selectedSubtypes
                      filteredSubSources.forEach((source) => {
                        if (
                          selectedSubtypes.findIndex(
                            (subType) => subType === source,
                          ) < 0
                        ) {
                          newSelectedSubSources.push(source)
                        }
                      })
                    }

                    formikProps.setFieldValue(
                      source.sourceId,
                      newSelectedSubSources,
                    )
                  } else {
                    formikProps.setFieldValue(
                      source.sourceId,
                      selectedSubtypes.filter(
                        (subType: string) =>
                          !filteredSubSources.includes(subType),
                      ),
                    )
                  }
                }}
                squareContainerStyle={
                  sharedColumnOptionsStyles.checkboxSquareContainer
                }
              />
              <Separator horizontal />
            </View>
          )
        }
        return null
      }

      // if subtypes reach certain size, move selected to the front
      const compareFunc = (first: string, second: string) => {
        if (
          filteredSubSources.length >= MINIMUM_SUBTYPES_SIZE_FOR_SORTING &&
          selectedSubtypes.includes(first) &&
          !selectedSubtypes.includes(second)
        ) {
          return -1
        }
        return 0
      }

      const filteredSubsourceRows = filteredSubSources
        .sort(compareFunc)
        .map((subtype: string) => {
          const subSourceNameBold = (
            <ThemedText
              color="foregroundColorMuted65"
              numberOfLines={1}
              style={{ fontWeight: '800' }}
            >
              {mapSourceIdToName(subtype, idToSourceOrSubSourceMap)}
            </ThemedText>
          )
          // Filter by the actual name, instead of by id.
          return (
            <View key={`add-news-column-details-source-subtype-${subtype}`}>
              <Checkbox
                checked={selectedSubtypes.includes(subtype)}
                containerStyle={
                  sharedColumnOptionsStyles.fullWidthCheckboxContainer
                }
                disabled={!editable}
                defaultValue={false}
                label={subSourceNameBold}
                onChange={(checked) => {
                  if (selectedSubtypes.includes(subtype)) {
                    const newlySelectedSubtypes = selectedSubtypes.filter(
                      (name: string) => name !== subtype,
                    )
                    // formik 2.1.1 is required here, otherwise setting this field
                    // to empty array will mark this field as undefined.
                    // See the below issue for more context:
                    // https://github.com/formium/formik/issues/2130
                    formikProps.setFieldValue(
                      source.sourceId,
                      newlySelectedSubtypes,
                    )
                  } else {
                    formikProps.setFieldValue(source.sourceId, [
                      ...selectedSubtypes,
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
          )
        })
      return (
        <>
          {renderSelectAll()}
          {filteredSubsourceRows}
        </>
      )
    }

    return (
      <View>
        {shouldShowSubSourceInput(source, idToSourceOrSubSourceMap)
          ? renderGenericFormTextInput(source, filter, setFilter)
          : null}
        {shouldShowError(source) &&
        isSourceOpenToAddSubsource(source.sourceId, idToSourceOrSubSourceMap)
          ? renderAddButton(() => {
              dispatch(
                actions.addSubsource({
                  sourceId: source.sourceId,
                  name: filter,
                }),
              )
            }, sourceState)
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

function isSourceOpenToAddSubsource(
  sourceId: string,
  idToSourceOrSubSourceMap: Record<string, SourceOrSubSource>,
) {
  return constants.SOURCE_NAMES_ENABLE_ADD_SUBSOURCE.includes(
    mapSourceIdToName(sourceId, idToSourceOrSubSourceMap),
  )
}

// Show a search bar in source if one of following conditions is met:
// 1. The source allows add new sub source.
// 2. There are more than MAX_ITEM_WITHOUT_FILTER subsources in the source.
function shouldShowSubSourceInput(
  source: NewsFeedColumnSource,
  idToSourceOrSubSourceMap: Record<string, SourceOrSubSource>,
): boolean {
  return (
    constants.SOURCE_NAMES_ENABLE_ADD_SUBSOURCE.includes(
      mapSourceIdToName(source.sourceId, idToSourceOrSubSourceMap),
    ) || source.subSourceIds.length > MAX_ITEM_WITHOUT_FILTER
  )
}

NewsSubtypesWithFilter.displayName = 'NewsSubtypesWithFilter'
