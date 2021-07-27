import { useFormik } from 'formik'
import React from 'react'
import { loginStyles } from '../../styles/loginStyles'
import { ThemedText } from '../themed/ThemedText'
import { ThemedTextInput } from '../themed/ThemedTextInput'

export interface SingleTextInputWithErrorMsgProps {
  // pass in the entire form value.
  formikProps: ReturnType<typeof useFormik>

  // field name for this component.
  field: string

  // default text to render to the user when text input is empty.
  placeholder: string

  textInputKey: string

  // whether to show the text in a secured way.
  secureTextEntry?: boolean
}

const SingleTextInputWithErrorMsg = React.memo(
  (props: SingleTextInputWithErrorMsgProps) => {
    const { formikProps, field, placeholder, textInputKey, secureTextEntry } =
      props

    function shouldRenderError(field: string): boolean {
      // Don't render error if the user never touched the form before.
      if (!formikProps.touched[field]) {
        return false
      }
      return !!formikProps.errors[field]
    }

    function renderError(field: string) {
      const hasError = !!formikProps.errors[field]

      return (
        <ThemedText
          style={loginStyles.error}
          color={shouldRenderError(field) ? 'red' : 'transparent'}
        >
          {formikProps.errors[field] || ' '}
        </ThemedText>
      )
    }

    return (
      <>
        <ThemedTextInput
          style={loginStyles.input}
          borderThemeColor={
            shouldRenderError(field) ? 'red' : 'foregroundColorMuted65'
          }
          borderHoverThemeColor={
            shouldRenderError(field) ? 'red' : 'foregroundColorMuted65'
          }
          borderFocusThemeColor={
            shouldRenderError(field) ? 'red' : 'foregroundColorMuted65'
          }
          placeholder={placeholder}
          textInputKey={textInputKey}
          onChangeText={(value) => {
            formikProps.setFieldValue(field, value)
          }}
          onBlur={() => {
            formikProps.setFieldTouched(field)
          }}
          value={formikProps.values[field]}
          secureTextEntry={secureTextEntry ? true : false}
        />
        {renderError(field)}
      </>
    )
  },
)

export default SingleTextInputWithErrorMsg
