import { NewsFeedDataExpressionWrapper } from '@devhub/core'
import { useFormik } from 'formik'
import React from 'react'
import { scaleFactor } from '../../../styles/variables'
import { ThemedTextInput } from '../../themed/ThemedTextInput'

export interface LiteralPredicateTextInputProps {
  text: string
  id: string
  setExpressionWrapper?: (payload: NewsFeedDataExpressionWrapper) => boolean
  onDelete?: () => boolean
  setFocusId?: (id: string) => void
}

export const LiteralPredicateTextInput = React.memo(
  React.forwardRef((props: LiteralPredicateTextInputProps, ref) => {
    const { text, id, setExpressionWrapper, onDelete, setFocusId } = props

    // Unfortunatly, we cannot simply use a value state to denote the input
    // value, and have to do it the hard way by using formik. This is because
    // tranditional TextInput with React State doesn't support Chinese input.
    const formikProps = useFormik({
      initialValues: { text: text },
      onSubmit(formValues, formikActions) {
        if (!formValues['text']) {
          // If we empty this text input, this should be considered as a
          // deletion and we should remove this node.
          if (onDelete) onDelete()
        } else {
          // Otherwise we're setting it to a new value. We reuse the same id.
          const newWrapperPayload: NewsFeedDataExpressionWrapper = {
            id: id,
            expr: {
              pred: {
                type: 'LITERAL',
                param: { text: formValues['text'] },
              },
            },
          }
          if (setExpressionWrapper) setExpressionWrapper(newWrapperPayload)
        }

        // Clear the focus id if setFocusId is provided. We need to delay this
        // function focus reset by a very small amount of time because this
        // reset will unmount the 3 logical gate buttons, and onClick event on
        // those 3 buttons will not be tracked correctly if onBlur happens
        // first.
        if (setFocusId) setTimeout(() => setFocusId(''), 120)
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
        blurOnSubmit={true}
        placeholder={'Literal or logical gate'}
      />
    )
  }),
)

LiteralPredicateTextInput.displayName = 'LiteralPredicateTextInput'
