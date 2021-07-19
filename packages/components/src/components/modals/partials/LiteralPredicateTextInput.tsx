import { NewsFeedDataExpressionWrapper } from '@devhub/core'
import { useFormik } from 'formik'
import React, { useState } from 'react'
import { scaleFactor } from '../../../styles/variables'
import { ThemedTextInput } from '../../themed/ThemedTextInput'

export interface LiteralPredicateTextInputProps {
  text: string
  id: string
  setExpressionWrapper?: (payload: NewsFeedDataExpressionWrapper) => boolean
  onDelete?: () => boolean
}

export const LiteralPredicateTextInput = React.memo(
  React.forwardRef((props: LiteralPredicateTextInputProps, ref) => {
    const { text, id, setExpressionWrapper, onDelete } = props

    // Unfortunatly, we cannot simply use a value state to denote the input
    // value, and have to do it the hard way by using formik. This is because
    // tranditional TextInput with React State doesn't support Chinese input.
    const formikProps = useFormik({
      initialValues: { text: text },
      onSubmit(formValues, formikActions) {
        if (!formValues['text']) {
          // If we empty this text input, this should be considered as a
          // deletion and we should remove this node, and also clear focus.
          if (onDelete) onDelete()
        } else {
          // Otherwise we're setting it to a new value. We reuse the same id.
          const newWrapperPayload: NewsFeedDataExpressionWrapper = {
            id: id,
            expr: {
              type: 'LITERAL',
              param: formValues['text'],
            },
          }
          if (setExpressionWrapper) setExpressionWrapper(newWrapperPayload)
        }
      },
      validateOnBlur: true,
      validateOnChange: true,
    })

    return (
      <ThemedTextInput
        autoFocus={true}
        ref={ref as any}
        clearButtonMode={'while-editing'}
        autoCapitalize="none"
        size={25 * scaleFactor}
        textInputKey={text}
        value={formikProps.values['text']}
        onChangeText={(v) => {
          formikProps.setFieldValue('text', v)
        }}
        autoCorrect={false}
        onSubmitEditing={() => formikProps.submitForm()}
        onBlur={() => formikProps.submitForm()}
        blurOnSubmit={false}
        placeholder={'Literal or logical gate'}
      />
    )
  }),
)

LiteralPredicateTextInput.displayName = 'LiteralPredicateTextInput'
