import {
  ColumnCreation,
  NewsFeedColumnSource,
  NewsFeedSourceType,
} from '@devhub/core'
import { FormikErrors, useFormik } from 'formik'
import _ from 'lodash'
import React, { Fragment, useEffect, useRef, useState } from 'react'
import { Keyboard, View } from 'react-native'
import { useDispatch } from 'react-redux'
import * as Yup from 'yup'

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
import { DialogConsumer, DialogProviderState } from '../context/DialogContext'
import { useAppLayout } from '../context/LayoutContext'
import { ThemedIcon } from '../themed/ThemedIcon'
import { NewsSubtypesWithFilter } from './partials/NewsSubtypesWithFilter'

interface initialValueAndSchema {
  initialValue: { subtypes: string[] }
  validationSchema: Yup.MixedSchema<any>
}

// Stores default data for rendering the menu.
export const formItemsMetadata: {
  WEIBO: initialValueAndSchema
  CAIXIN: initialValueAndSchema
} = {
  WEIBO: {
    // We don't defaultly select any source.
    initialValue: { subtypes: [] },
    validationSchema: Yup.mixed().required('Required'),
  },
  CAIXIN: {
    initialValue: { subtypes: [] },
    validationSchema: Yup.mixed().required('Required'),
  },
}

export const formInitialValues = _.mapValues(
  formItemsMetadata,
  (v) => v.initialValue.subtypes,
) as {
  [key in NewsFeedSourceType]: typeof formItemsMetadata[key]['initialValue']['subtypes']
}

export interface AddColumnDetailsModalProps {
  showBackButton: boolean
}

export const AddColumnDetailsModal = React.memo(
  (props: AddColumnDetailsModalProps) => {
    const { showBackButton } = props

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
          title: 'DUMMY_COLUMN_NAME',
          type: 'COLUMN_TYPE_NEWS_FEED',
          id: 'dummy_column_id',
          itemListIds: [],
          firstItemId: '',
          lastItemId: '',
          sources: [
            {
              source: 'WEIBO',
              subtypes: ['DUMMY_SUBTYPE'],
            },
          ],
        }
        console.log(formikProps.values)
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

    // Renders Source and Sub sources. For example this could be Weibo with a
    // list of users.
    function renderSingleSourceOptions(
      source: NewsFeedColumnSource,
      { required }: { required?: boolean } = {},
    ) {
      const isOptionsOpened = openedSource === source.source

      return (
        <View key={`add-news-column-details-source-${source.source}`}>
          <TouchableWithoutFeedback
            onPress={() => {
              formikProps.setFieldTouched(source.source)

              // If we're clicking the already opened source, reset the
              // openedSource state and collapse all options. Otherwise we
              // should replace the openedSource.
              setOpenedSource(isOptionsOpened ? '' : source.source)
            }}
          >
            <View>
              <View style={[sharedStyles.flex, sharedStyles.horizontal]}>
                <H3>{source.source}</H3>
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

    // TODO(chenweilunster): This should be fetching from redux store instead
    // of hard coded here. The Redux state could have some default values.
    function getSources(): NewsFeedColumnSource[] {
      return [
        {
          source: 'WEIBO',
          subtypes: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        },
        { source: 'CAIXIN', subtypes: ['ABC', 'BCD', 'CDE'] },
      ]
    }

    function renderContent() {
      return (
        <View style={{ paddingHorizontal: contentPadding }}>
          {
            // TODO(chenweilunster): We should provide something here.
            getSources().map((formItem, formItemIndex) => {
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
            })
          }
        </View>
      )
    }

    return (
      <ModalColumn
        name="ADD_COLUMN_DETAILS"
        showBackButton={showBackButton}
        title="Add News Column"
      >
        <DialogConsumer>
          {(Dialog) => {
            dialogRef.current = Dialog

            return (
              <>
                {renderHeader('Sources')}

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
