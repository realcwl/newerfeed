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

import { useReduxState } from '../../hooks/use-redux-state'
import { Platform } from '../../libs/platform'
import * as actions from '../../redux/actions'
import * as selectors from '../../redux/selectors'
import { sharedStyles } from '../../styles/shared'
import { contentPadding, scaleFactor } from '../../styles/variables'
import { ModalColumn } from '../columns/ModalColumn'
import { AccordionView } from '../common/AccordionView'
import { Button } from '../common/Button'
import { H3 } from '../common/H3'
import { Separator } from '../common/Separator'
import { Spacer } from '../common/Spacer'
import { SubHeader } from '../common/SubHeader'
import { TouchableWithoutFeedback } from '../common/TouchableWithoutFeedback'
import { DropDownIconPicker } from './partials/DropDownIconPicker'
import { DialogConsumer, DialogProviderState } from '../context/DialogContext'
import { useAppLayout } from '../context/LayoutContext'
import { ThemedIcon } from '../themed/ThemedIcon'
import {
  ThemedTextInput,
  ThemedTextInputProps,
} from '../themed/ThemedTextInput'
import { NewsSubtypesWithFilter } from './partials/NewsSubtypesWithFilter'

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
    const availableNewsFeedSources = useReduxState(
      selectors.availableNewsFeedSourcesSelector,
    )
    // Get all main sources.
    const allSources = availableNewsFeedSources.map((source) => source.sourceId)

    const newsFeedColumnAttributes = selectors.columnSelector(
      store.getState(),
      columnId ? columnId : '',
    )

    // Construct form's initial value. It's either empty, when we're adding a
    // brand new column, or populated with existing column's attribute, when we
    // are modifying attributes of one existing column.
    function getFormInitialValues(
      columnId: string | undefined,
    ): Record<string, any> {
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
        name: newsFeedColumnAttributes.title,
        icon: newsFeedColumnAttributes.icon,
        // Make a deepcopy, otherwise every addtion or removal is happening on
        // the real redux object.
        dataExpression: _.cloneDeep(newsFeedColumnAttributes.dataExpression),
      }
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
          title: formValues['name'],
          icon: formValues['icon'],
          type: 'COLUMN_TYPE_NEWS_FEED',
          id: columnId ? columnId : guid(),
          isUpdate: !!columnId,
          itemListIds: newsFeedColumnAttributes?.itemListIds ?? [],
          newestItemId: '',
          oldestItemId: '',
          sources: getColumnSourcesFromFormValues(formValues),
          dataExpression: formValues['dataExpression'],
          state: 'not_loaded',
          options: newsFeedColumnAttributes?.options ?? {
            // show unread by default.
            enableAppIconUnreadIndicator: true,
          },
        }
        dispatch(actions.addColumn(columnCreation))

        // formikActions.setSubmitting(false)
      },
      validateOnBlur: true,
      validateOnChange: true,
      validate(values) {
        if (!values.name) {
          return { err: 'name is required' }
        }
        for (const key of allSources) {
          if (values[key].length !== 0) {
            return undefined
          }
        }
        return { err: 'no source selected' }
      },
    })

    // openedSource determines which source dropdown is selected. If
    // openedSource is empty string, it means all options are closed. At any
    // given time, there could only be a single dropdown opened.
    const [openedSource, setOpenedSource] = useState('')

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
            <NewsSubtypesWithFilter source={source} formikProps={formikProps} />
          </AccordionView>
        </View>
      )
    }

    function renderSourceAndSubtypesSelectors() {
      return (
        <View style={{ paddingHorizontal: contentPadding }}>
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
                <Separator horizontal />
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
              textInputKey={`add-column-details-column-name-text-input`}
              borderThemeColor={
                shouldShowError()
                  ? 'lightRed'
                  : !!formikProps.values['name']
                  ? 'green'
                  : undefined
              }
              borderHoverThemeColor={
                shouldShowError()
                  ? 'lightRed'
                  : !!formikProps.values['name']
                  ? 'green'
                  : undefined
              }
              borderFocusThemeColor={
                shouldShowError()
                  ? 'lightRed'
                  : !!formikProps.values['name']
                  ? 'green'
                  : undefined
              }
              {...defaultTextInputProps}
              onBlur={() => {
                formikProps.setFieldTouched('name')
              }}
              onChangeText={(value) => {
                formikProps.setFieldValue('name', value)
              }}
              value={formikProps.values['name']}
            />
          </View>

          <Spacer height={contentPadding / 2} />
        </>
      )
    }

    return (
      <ModalColumn
        name="ADD_COLUMN_DETAILS"
        showBackButton={showBackButton}
        title={columnId ? 'Edit News Column Attribute' : 'Add News Column'}
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

                <View style={sharedStyles.paddingHorizontal}>
                  <Button
                    analyticsLabel="add_or_set_column"
                    disabled={!formikProps.isValid || formikProps.isSubmitting}
                    onPress={formikProps.submitForm}
                  >
                    {columnId ? 'Save Column Attribute' : 'Add Column'}
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
