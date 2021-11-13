import {
  ColumnCreation,
  guid,
  mapSourceIdToName,
  NewsFeedColumnSource,
} from '@devhub/core'
import { useFormik } from 'formik'
import _ from 'lodash'
import React, { Fragment, useEffect, useRef, useState } from 'react'
import { Keyboard, View } from 'react-native'
import { useDispatch, useStore } from 'react-redux'
import { DataExpressionEditorContainer } from '../../containers/DataExpressionEditorContainer'
import { Checkbox } from '../common/Checkbox'

import { useReduxState } from '../../hooks/use-redux-state'
import { Platform } from '../../libs/platform'
import * as actions from '../../redux/actions'
import * as selectors from '../../redux/selectors'
import { sharedStyles } from '../../styles/shared'
import {
  contentPadding,
  normalTextSize,
  scaleFactor,
  smallTextSize,
} from '../../styles/variables'
import { ModalColumn } from '../columns/ModalColumn'
import { AccordionView } from '../common/AccordionView'
import { Button } from '../common/Button'
import { H3 } from '../common/H3'
import { Separator } from '../common/Separator'
import { Spacer } from '../common/Spacer'
import { SubHeader } from '../common/SubHeader'
import { TouchableWithoutFeedback } from '../common/TouchableWithoutFeedback'
import { ProgressBar } from '../common/ProgressBar'
import { DropDownIconPicker } from './partials/DropDownIconPicker'
import { DialogConsumer, DialogProviderState } from '../context/DialogContext'
import { useAppLayout } from '../context/LayoutContext'
import { ThemedIcon } from '../themed/ThemedIcon'
import {
  ThemedTextInput,
  ThemedTextInputProps,
} from '../themed/ThemedTextInput'
import { NewsSubtypesWithFilter } from './partials/NewsSubtypesWithFilter'
import { useColumnCreatedByCurrentUser } from '../../hooks/use-column-created-by-current-user'
import { SELECT_ALL, UNSELECT_ALL } from '../../resources/strings'
import { ThemedText } from '../themed/ThemedText'

export interface AddColumnDetailsModalProps {
  showBackButton: boolean

  // If we're modifying attribute of an existing column, we should pass the
  // columnId of that column.
  columnId?: string
}

export const AddColumnDetailsModal = React.memo(
  (props: AddColumnDetailsModalProps) => {
    const { showBackButton, columnId } = props
    const store = useStore()
    const idToSourceOrSubSourceMap = useReduxState(
      selectors.idToSourceOrSubSourceMapSelector,
    )
    const subscribeOnly = !useColumnCreatedByCurrentUser(columnId ?? '')
    const availableNewsFeedSources = useReduxState(
      selectors.availableNewsFeedSourcesSelector,
    )
    const allSubsourcesCount = useReduxState(
      selectors.availableNewsFeedSubsourcesCountSelecter,
    )

    // openedSource determines which source dropdown is selected. If
    // openedSource is empty string, it means all options are closed. At any
    // given time, there could only be a single dropdown opened.
    const [openedSource, setOpenedSource] = useState('')
    const [selectedSubSourcesCount, setSelectedSubSourcesCount] = useState(0)
    const allSubSourcesSelected = selectedSubSourcesCount >= allSubsourcesCount

    // Get all main sources.
    const allSources = availableNewsFeedSources.map((source) => source.sourceId)

    const newsFeedColumnAttributes = selectors.columnSelector(
      store.getState(),
      columnId ? columnId : '',
    )

    // Construct form's initial value. It's either empty, when we're adding a
    // brand new column, or populated with existing column's attribute, when we
    // are modifying attributes of one existing column.
    function getFormInitialValues(columnId?: string): Record<string, any> {
      const res: Record<string, any> = {
        name: '',
        // Create a creator expression by default.
        dataExpression: {
          id: guid(),
        },
        // Default icon is always material.rss-feed.
        icon: {
          family: 'material',
          name: 'rss-feed',
        },
      }
      for (const source of allSources) {
        res[source] = []
      }

      // If no column id is provided, just populate with default value.
      if (!columnId) return res

      // else.. it must be an existing column and thus we need to pre-populate
      // form values with existing data.
      if (!newsFeedColumnAttributes) {
        console.warn('Edit existing column, but attribute is undefined')
        return res
      }

      for (const columnSource of newsFeedColumnAttributes.sources) {
        res[columnSource.sourceId] = columnSource.subSourceIds
      }

      return {
        ...res,
        columnId,
        creator: newsFeedColumnAttributes.creator,
        name: newsFeedColumnAttributes.title,
        icon: newsFeedColumnAttributes.icon,
        // Make a deepcopy, otherwise every addtion or removal is happening on
        // the real redux object.
        dataExpression: _.cloneDeep(newsFeedColumnAttributes.dataExpression),
        visibility: newsFeedColumnAttributes.visibility,
        subscriberCount: newsFeedColumnAttributes.subscriberCount,
      }
    }

    const updateSubSourcesInFormValues = (option: 'empty' | 'selectAll') => {
      const formValues: Record<string, any> = {
        name: formikProps.values.name,
        dataExpression: formikProps.values.dataExpression,
        icon: formikProps.values.icon,
      }
      allSources.map((source, index) => {
        if (option === 'selectAll') {
          formValues[source] = availableNewsFeedSources[index].subSourceIds
        } else {
          formValues[source] = []
        }
      })

      return formValues
    }

    const formInitialValues: Record<string, any> =
      getFormInitialValues(columnId)

    const dialogRef = useRef<DialogProviderState>()
    const dispatch = useDispatch()
    const { sizename } = useAppLayout()

    const formikProps = useFormik({
      initialValues: formInitialValues,
      onSubmit(formValues, formikActions) {
        // formikActions.setSubmitting(false)

        Keyboard.dismiss()
        dispatch(actions.closeAllModals())

        // Create a empty column.
        const columnCreation: ColumnCreation = {
          subscribeOnly,
          title: formValues['name'],
          icon: formValues['icon'],
          type: 'COLUMN_TYPE_NEWS_FEED',
          id: columnId ? columnId : guid(),
          isUpdate: !!columnId,
          itemListIds: newsFeedColumnAttributes?.itemListIds ?? [],
          newestItemId: '',
          oldestItemId: '',
          creator: newsFeedColumnAttributes?.creator,
          sources: getColumnSourcesFromFormValues(formValues),
          dataExpression: formValues['dataExpression'],
          state: 'not_loaded',
          options: newsFeedColumnAttributes?.options ?? {
            // show unread by default.
            enableAppIconUnreadIndicator: true,
          },
          visibility: formValues['visibility'] ?? 'PRIVATE',
          subscriberCount: formValues['subscriberCount'] ?? 1,
        }
        dispatch(actions.addColumn(columnCreation))

        // formikActions.setSubmitting(false)
      },
      validateOnBlur: true,
      validateOnChange: true,

      // avoid multiple setFieldValue at the same time
      // otherwise validate is not guaranteed to called with latest values
      validate: (values) => {
        let newSelectedSubSourcesCount = 0
        for (const key of allSources) {
          newSelectedSubSourcesCount += values[key]?.length || 0
        }

        if (newSelectedSubSourcesCount !== selectedSubSourcesCount) {
          setSelectedSubSourcesCount(newSelectedSubSourcesCount)
        }
        if (newSelectedSubSourcesCount <= 0) {
          return { err: 'no source selected' }
        }
        if (!values.name || values.name === '') {
          return { name: 'name is required' }
        }
        return undefined
      },
    })

    const submitButtonDisabled =
      !formikProps.isValid || formikProps.isSubmitting

    useEffect(() => {
      void formikProps.validateForm()
    }, [])

    function renderHeader(title: string) {
      return (
        <SubHeader icon={undefined} title={title}>
          {(() => {
            return (
              <View style={[sharedStyles.flex, sharedStyles.horizontal]}>
                <Spacer flex={1} />

                <ThemedIcon
                  color="foregroundColorMuted65"
                  family="material"
                  name={'article'}
                  size={18 * scaleFactor}
                  {...Platform.select({
                    web: {
                      title: title,
                    },
                  })}
                />
              </View>
            )
          })()}
        </SubHeader>
      )
    }

    // Show the current selection status. e.g. "Twitter (1/10)""
    function getNumberOfSelectionLabel(
      selected: string[],
      source: NewsFeedColumnSource,
    ): string {
      if (selected.length === 0) {
        return ''
      }
      return ` (${selected.length}/${source.subSourceIds.length})`
    }

    // When submitting the form, extract sources and subtypes from the
    // formValues.
    function getColumnSourcesFromFormValues(
      formValues: typeof formInitialValues,
    ): NewsFeedColumnSource[] {
      const sources: NewsFeedColumnSource[] = []
      for (const key of allSources) {
        if (formValues[key].length === 0) continue
        sources.push({
          sourceId: key,
          subSourceIds: formValues[key],
        })
      }
      return sources
    }

    // Renders Source and Sub sources. For example this could be Weibo with a
    // list of users.
    function renderSingleSourceOptions(source: NewsFeedColumnSource) {
      const isOptionsOpened = openedSource === source.sourceId

      return (
        <View key={`add-news-column-details-source-${source.sourceId}`}>
          <TouchableWithoutFeedback
            onPress={() => {
              formikProps.setFieldTouched(source.sourceId)

              // If we're clicking the already opened source, reset the
              // openedSource state and collapse all options. Otherwise we
              // should replace the openedSource.
              setOpenedSource(isOptionsOpened ? '' : source.sourceId)
            }}
          >
            <View>
              <View style={[sharedStyles.flex, sharedStyles.horizontal]}>
                <H3>
                  {`${mapSourceIdToName(
                    source.sourceId,
                    idToSourceOrSubSourceMap,
                  )}${getNumberOfSelectionLabel(
                    formikProps.values[source.sourceId],
                    source,
                  )}`}
                </H3>
                <Spacer flex={1} />
                <ThemedIcon
                  color="foregroundColorMuted65"
                  family="material"
                  name={isOptionsOpened ? 'expand-more' : 'chevron-left'}
                  size={18 * scaleFactor}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>

          <AccordionView isOpen={isOptionsOpened}>
            <Spacer height={contentPadding} />
            <NewsSubtypesWithFilter
              source={source}
              formikProps={formikProps}
              editable={!subscribeOnly}
            />
          </AccordionView>
        </View>
      )
    }

    function renderSelectAll() {
      if (subscribeOnly) {
        return null
      } else {
        return (
          <View style={{ paddingBottom: contentPadding }}>
            <Button
              type={allSubSourcesSelected ? 'danger' : 'neutral'}
              onPress={() => {
                formikProps.setValues(
                  updateSubSourcesInFormValues(
                    allSubSourcesSelected ? 'empty' : 'selectAll',
                  ),
                )
              }}
            >
              {allSubSourcesSelected ? UNSELECT_ALL : SELECT_ALL}
            </Button>
          </View>
        )
      }
    }

    function renderSourceAndSubtypesSelectors() {
      return (
        <View style={{ paddingHorizontal: contentPadding }}>
          {renderSelectAll()}
          {availableNewsFeedSources.map((formItem, formItemIndex) => {
            const content = renderSingleSourceOptions(formItem)

            if (!content) {
              if (__DEV__) {
                // eslint-disable-next-line no-console
                console.warn(
                  `[AddColumnDetailsModal] No form defined for "${formItem}"`,
                )
              }
              return null
            }

            return (
              <Fragment
                key={`add-column-details-modal-formik-item-${formItem}-${formItemIndex}`}
              >
                {content}
                <Spacer height={contentPadding} />
                {idToSourceOrSubSourceMap[formItem.sourceId].state ==
                'loading' ? (
                  <ProgressBar indeterminate />
                ) : (
                  <Separator horizontal />
                )}
                <Spacer height={contentPadding} />
              </Fragment>
            )
          })}
        </View>
      )
    }

    function renderDataExpressionEditor() {
      return (
        <View style={{ paddingHorizontal: contentPadding }}>
          <DataExpressionEditorContainer formikProps={formikProps} />
        </View>
      )
    }

    // Render the text input box that let user to name their column.
    function renderColumnNameTextInput() {
      const defaultTextInputProps: Partial<ThemedTextInputProps> = {
        autoCapitalize: 'none',
        autoCorrect: false,
        autoFocus: false,
        blurOnSubmit: false,
        placeholder: 'Column Name',
      }

      // Show error if string doesn't have value but is touched.
      function shouldShowError() {
        if (!formikProps.touched['name']) {
          return false
        }
        return !formikProps.values['name']
      }

      const borderColor = subscribeOnly ? 'gray' : 'green'

      return (
        <>
          <SubHeader icon={undefined} title={'Column Name'}>
            {(() => {
              return (
                <View style={[sharedStyles.flex, sharedStyles.horizontal]}>
                  <Spacer flex={1} />

                  <ThemedIcon
                    color="foregroundColorMuted65"
                    family="material"
                    name={'title'}
                    size={18 * scaleFactor}
                    {...Platform.select({
                      web: {
                        title: 'Column Name',
                      },
                    })}
                  />
                </View>
              )
            })()}
          </SubHeader>

          <View style={sharedStyles.paddingHorizontal}>
            <ThemedTextInput
              editable={!subscribeOnly}
              selectTextOnFocus={!subscribeOnly}
              textInputKey={`add-column-details-column-name-text-input`}
              borderThemeColor={
                shouldShowError()
                  ? 'lightRed'
                  : !!formikProps.values['name']
                  ? borderColor
                  : undefined
              }
              borderHoverThemeColor={
                shouldShowError()
                  ? 'lightRed'
                  : !!formikProps.values['name']
                  ? borderColor
                  : undefined
              }
              borderFocusThemeColor={
                shouldShowError()
                  ? 'lightRed'
                  : !!formikProps.values['name']
                  ? borderColor
                  : undefined
              }
              {...defaultTextInputProps}
              onBlur={() => {
                formikProps.setFieldTouched('name')
              }}
              onChangeText={(value) => {
                formikProps.setFieldValue('name', value)
              }}
              value={
                subscribeOnly
                  ? `${formikProps.values['name']}(${formikProps.values['creator'].name})`
                  : formikProps.values['name']
              }
            />
          </View>

          <Spacer height={contentPadding / 2} />
        </>
      )
    }

    const checkboxSize = 18

    return (
      <ModalColumn
        name="ADD_COLUMN_DETAILS"
        showBackButton={showBackButton}
        title={
          subscribeOnly
            ? 'Subscribe to Feed'
            : columnId
            ? 'Edit News Column Attribute'
            : 'Add News Column'
        }
      >
        <DialogConsumer>
          {(Dialog) => {
            dialogRef.current = Dialog

            return (
              <>
                {renderColumnNameTextInput()}
                {renderHeader('Sources')}

                <Separator horizontal />
                <Spacer height={contentPadding} />

                <View style={sharedStyles.fullWidth}>
                  {renderSourceAndSubtypesSelectors()}
                </View>

                {renderHeader('Column Icon (Optional)')}
                <DropDownIconPicker data={[]} formikProps={formikProps} />

                {renderHeader('News Expression (Optional)')}
                <View style={sharedStyles.fullWidth}>
                  {renderDataExpressionEditor()}
                </View>

                {renderHeader('Visibility')}
                <View
                  style={[
                    sharedStyles.flex,
                    sharedStyles.horizontal,
                    sharedStyles.paddingHorizontal,
                  ]}
                >
                  <H3>Set Feed Public</H3>
                  <Spacer width={contentPadding / 2} />
                  <ThemedIcon
                    family="material"
                    name="group"
                    color="foregroundColorMuted65"
                    style={
                      formikProps.values['visibility'] === 'GLOBAL'
                        ? sharedStyles.alignSelfCenter
                        : sharedStyles.displayNone
                    }
                  />
                  <Spacer width={contentPadding / 4} />
                  <ThemedText
                    color="foregroundColorMuted65"
                    style={
                      formikProps.values['visibility'] === 'GLOBAL'
                        ? sharedStyles.alignItemsCenter
                        : sharedStyles.displayNone
                    }
                  >
                    {formikProps.values['subscriberCount'] ?? '0'}
                  </ThemedText>
                  <Spacer flex={1} />
                  <Checkbox
                    containerStyle={{
                      height: checkboxSize * scaleFactor,
                      width: checkboxSize * scaleFactor,
                    }}
                    squareContainerStyle={{
                      height: checkboxSize * scaleFactor,
                      width: checkboxSize * scaleFactor,
                    }}
                    analyticsLabel="column_option_in_feed_sharing_settings"
                    checked={formikProps.values['visibility'] === 'GLOBAL'}
                    defaultValue
                    disabled={subscribeOnly}
                    onChange={(value) => {
                      formikProps.setFieldValue(
                        'visibility',
                        value ? 'GLOBAL' : 'PRIVATE',
                      )
                    }}
                  />
                </View>
                <Spacer height={contentPadding} />

                <View style={sharedStyles.paddingHorizontal}>
                  <Button
                    analyticsLabel="add_or_set_column"
                    disabled={submitButtonDisabled}
                    onPress={formikProps.submitForm}
                    type="primary"
                  >
                    {subscribeOnly
                      ? 'Subscribe to Feed'
                      : columnId
                      ? 'Save Column Attribute'
                      : 'Add Column'}
                  </Button>
                </View>

                <Spacer height={contentPadding / 2} />
              </>
            )
          }}
        </DialogConsumer>
      </ModalColumn>
    )
  },
)

AddColumnDetailsModal.displayName = 'AddColumnDetailsModal'
