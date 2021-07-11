import { ColumnCreation, guid, ThemeColors } from '@devhub/core'
import { FormikErrors, useFormik } from 'formik'
import _ from 'lodash'
import React, { Fragment, useEffect, useRef } from 'react'
import { Keyboard, View } from 'react-native'
import { useDispatch } from 'react-redux'
import * as Yup from 'yup'

import { useReduxState } from '../../hooks/use-redux-state'
import { bugsnag } from '../../libs/bugsnag'
import { Platform } from '../../libs/platform'
import { IconProp } from '../../libs/vector-icons'
import * as actions from '../../redux/actions'
import * as selectors from '../../redux/selectors'
import { sharedStyles } from '../../styles/shared'
import {
  contentPadding,
  scaleFactor,
  smallerTextSize,
  smallTextSize,
} from '../../styles/variables'
import { EMPTY_ARRAY } from '../../utils/constants'
import { columnHeaderItemContentSize } from '../columns/ColumnHeader'
import { ColumnOptionsInboxContent } from '../columns/ColumnOptionsInbox'
import { ModalColumn } from '../columns/ModalColumn'
import { sharedColumnOptionsStyles } from '../columns/options/shared'
import { Button } from '../common/Button'
import { Checkbox } from '../common/Checkbox'
import { H3 } from '../common/H3'
import { Separator } from '../common/Separator'
import { Spacer } from '../common/Spacer'
import { SubHeader } from '../common/SubHeader'
import { DialogConsumer, DialogProviderState } from '../context/DialogContext'
import { useAppLayout } from '../context/LayoutContext'
import { ThemedIcon } from '../themed/ThemedIcon'
import { ThemedText } from '../themed/ThemedText'
import {
  ThemedTextInput,
  ThemedTextInputProps,
} from '../themed/ThemedTextInput'

export type FormItem = 'inbox'

export const formItemsMetadata = {
  inbox: {
    initialValue: 'all' as 'all' | 'participating',
    validationSchema: Yup.mixed()
      .required('Required')
      .oneOf(['all', 'participating'], 'Invalid'),
  },
}

export const formInitialValues = _.mapValues(
  formItemsMetadata,
  (v) => v.initialValue,
) as { [key in FormItem]: typeof formItemsMetadata[key]['initialValue'] }

export const formValidationSchema = _.mapValues(
  formItemsMetadata,
  (v) => v.validationSchema,
) as { [key in FormItem]: typeof formItemsMetadata[key]['validationSchema'] }

export interface AddColumnDetailsModalProps {
  showBackButton: boolean
}

const CIRCLE_CHARACTER = '●'

export const AddColumnDetailsModal = React.memo(
  (props: AddColumnDetailsModalProps) => {
    const { showBackButton } = props

    const dialogRef = useRef<DialogProviderState>()
    const dispatch = useDispatch()
    const { sizename } = useAppLayout()

    const loggedUsername = 'LOGGED_USER_NAME'

    const formikProps = useFormik({
      initialValues: formInitialValues,
      onSubmit(formValues, formikActions) {
        // formikActions.setSubmitting(false)

        Keyboard.dismiss()
        dispatch(actions.closeAllModals())

        // Create a empty column.
        const columnCreation: ColumnCreation = {
          title: 'DUMMY_COLUMN_NAME',
          type: 'COLUMN_TYPE_NEWS_FEED',
          id: 'dummy_column_id',
          itemListIds: [],
          firstItemId: '',
          lastItemId: '',
          sources: [
            {
              source: 'DUMMY_SOURCE',
              subtypes: ['DUMMY_SUBTYPE'],
            },
          ],
        }
        dispatch(actions.addColumn(columnCreation))

        // formikActions.setSubmitting(false)
      },
      validateOnBlur: true,
      validateOnChange: true,
      validate(values) {
        const errors: FormikErrors<typeof formInitialValues> = {}
        return errors
      },
    })

    useEffect(() => {
      void formikProps.validateForm()
    }, [])

    function shouldShowError(formItem: FormItem) {
      if (!formItem) return false

      if (
        !(
          formikProps.touched[formItem] ||
          (formItem.endsWith('_option') &&
            Object.keys(formikProps.touched).some((item) =>
              item.endsWith('_option'),
            )) ||
          formikProps.submitCount > 0
        )
      )
        return false

      const error = formikProps.errors[formItem]
      return !!error
    }

    function ErrorMessage({
      name,
      required,
    }: {
      name: FormItem
      required: boolean | undefined
    }) {
      if (!shouldShowError(name)) return null

      let error = formikProps.errors[name]
      if (error === 'Required' && required === false) error = 'Empty'

      if (error === CIRCLE_CHARACTER) {
        return (
          <ThemedText
            color={getErrorColor({ required: false })}
            style={{ fontSize: smallerTextSize }}
          >
            {error}
          </ThemedText>
        )
      }

      return (
        <ThemedText
          color={getErrorColor({ required })}
          style={{ fontSize: smallTextSize, fontStyle: 'italic' }}
        >
          {error}
        </ThemedText>
      )
    }

    function renderHeader() {
      return (
        <SubHeader icon={undefined} title={'DUMMY_HEADER_TITLE'}>
          {(() => {
            const text = 'RENDER_HEADER_DUMMY_TEXT'
            return (
              <View style={[sharedStyles.flex, sharedStyles.horizontal]}>
                <Spacer flex={1} />

                <ThemedIcon
                  color="foregroundColorMuted65"
                  family="octicon"
                  name={'lock'}
                  onPress={() => {
                    console.log('PRESSED_RENDER_HEADER')
                  }}
                  size={18 * scaleFactor}
                  style={[
                    Platform.select({
                      web: {
                        cursor: 'help',
                      },
                    }),
                  ]}
                  {...Platform.select({
                    web: {
                      title: text,
                    },
                  })}
                />
              </View>
            )
          })()}
        </SubHeader>
      )
    }

    function renderFormItemHeader(
      formItem: FormItem,
      title: string,
      { required }: { required: boolean | undefined },
    ) {
      return (
        <View style={sharedStyles.horizontal}>
          <H3
            color={
              shouldShowError(formItem)
                ? getErrorColor({ required })
                : undefined
            }
            withMargin
          >
            {title}
          </H3>
          <Spacer flex={1} />
          <ErrorMessage name={formItem} required={required} />
        </View>
      )
    }

    function renderFormItem(
      formItem: FormItem,
      { required }: { required?: boolean } = {},
    ) {
      switch (formItem) {
        case 'inbox':
          return (
            <View key={`add-column-details-form-item-${formItem}`}>
              {renderFormItemHeader(formItem, 'Inbox', { required })}

              <ColumnOptionsInboxContent
                inbox={formikProps.values.inbox}
                onChange={(value) => {
                  formikProps.setFieldTouched(formItem)
                  formikProps.setFieldValue(formItem, value)
                }}
              />
            </View>
          )
        default:
          return null
      }
    }

    function renderContent() {
      return (
        <View style={{ paddingHorizontal: contentPadding }}>
          {
            // TODO(chenweilunster): We should provide something here.
            [].map((formItem, formItemIndex) => {
              const content = renderFormItem(formItem)

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
            })
          }

          {/* {!!__DEV__ && (
            <ThemedText color="foregroundColorMuted65">
              {JSON.stringify(formikProps, null, 2)}
            </ThemedText>
          )} */}
        </View>
      )
    }

    const defaultTextInputProps: Partial<ThemedTextInputProps> = {
      autoCapitalize: 'none',
      autoCorrect: false,
      autoFocus: false,
      blurOnSubmit: false,
      placeholder: '',
      onSubmitEditing: () => {
        void formikProps.submitForm()
      },
    }

    // TODO(chenweilunster): This seemed to be very useful, we'll leave it here.
    function renderGenericFormTextInput<F extends FormItem>(
      formItem: F,
      required = true,
      textInputProps: Partial<ThemedTextInputProps> = {},
    ) {
      const errorColor = getErrorColor({ required })

      return (
        <ThemedTextInput
          textInputKey={`add-column-details-text-input-${formItem}`}
          borderThemeColor={shouldShowError(formItem) ? errorColor : undefined}
          borderHoverThemeColor={
            shouldShowError(formItem) ? errorColor : undefined
          }
          borderFocusThemeColor={
            shouldShowError(formItem) ? errorColor : undefined
          }
          {...defaultTextInputProps}
          onBlur={() => {
            formikProps.setFieldTouched(formItem)
          }}
          onChangeText={(value) => {
            formikProps.setFieldValue(formItem, value)
          }}
          value={`${formikProps.values[formItem]?.toString() || ''}`}
          {...textInputProps}
        />
      )
    }

    return (
      <ModalColumn
        name="ADD_COLUMN_DETAILS"
        showBackButton={showBackButton}
        title="Add Column"
      >
        <DialogConsumer>
          {(Dialog) => {
            dialogRef.current = Dialog

            return (
              <>
                {renderHeader()}

                <Separator horizontal />
                <Spacer height={contentPadding} />

                <View
                  style={
                    sizename <= '2-medium'
                      ? sharedStyles.flex
                      : sharedStyles.fullWidth
                  }
                >
                  {renderContent()}
                </View>

                <View style={sharedStyles.paddingHorizontal}>
                  <Button
                    analyticsLabel="add_column"
                    disabled={!formikProps.isValid || formikProps.isSubmitting}
                    onPress={formikProps.submitForm}
                  >
                    Add Column
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

function getErrorColor({
  required,
}: { required?: boolean } = {}): keyof ThemeColors {
  return required === false ? 'yellow' : 'lightRed'
}
