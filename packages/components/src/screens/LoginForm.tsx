import { FormikErrors, useFormik } from 'formik'
import React from 'react'
import { StyleSheet } from 'react-native'
import { useDispatch } from 'react-redux'
import { LoginButton } from '../components/common/LoginButton'
import { Spacer } from '../components/common/Spacer'
import { useLoginHelpers } from '../components/context/LoginHelpersContext'
import { ThemedTextInput } from '../components/themed/ThemedTextInput'
import { loginRequest, loginSuccess } from '../redux/actions'
import { contentPadding, scaleFactor } from '../styles/variables'
import * as Yup from 'yup'
import { ThemedText } from '../components/themed/ThemedText'
import * as selectors from '../redux/selectors'
import { useReduxState } from '../hooks/use-redux-state'

const EMAIL = 'email'
const PASSWORD = 'password'
const ALL_FIELDS = [EMAIL, PASSWORD]

const styles = StyleSheet.create({
  button: {
    alignSelf: 'stretch',
    marginTop: contentPadding / 2,
  },

  input: {
    alignSelf: 'stretch',
    marginTop: contentPadding / 2,
    height: 45 * scaleFactor,
  },

  error: {
    alignSelf: 'center',
    marginTop: contentPadding / 3,
    fontWeight: 'bold',
    maxWidth: 300 * scaleFactor,
  },
})

export const LoginForm = React.memo(() => {
  const { isLoggingIn } = useLoginHelpers()
  const dispatch = useDispatch()
  const authError = useReduxState(selectors.authErrorSelector)

  const formInitialValues: Record<string, string> = {
    email: '',
    password: '',
  }

  const formValidationSchema: Record<string, any> = {
    email: Yup.string().email('Invalid email addresss').required('Required'),
    password: Yup.string()
      .required('Required')
      .min(8, 'should be 8 chars minimum.')
      .matches(
        /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,~<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
        'Must contain uppercase, number and special character',
      ),
  }

  const formikProps = useFormik({
    initialValues: formInitialValues,
    validationSchema: Yup.object(formValidationSchema),
    onSubmit(formValues, formikActions) {
      // Indicate that we're logining in.
      dispatch(
        loginRequest({
          email: formValues[EMAIL],
          password: formValues[PASSWORD],
        }),
      )
    },
    validateOnChange: true,
    validate(values) {
      const errors: FormikErrors<typeof formInitialValues> = {}

      function validateField(formItem: string) {
        try {
          formValidationSchema[formItem].validateSync(values[formItem])
        } catch (error) {
          errors[formItem] = (error as Yup.ValidationError).message
        }
      }

      validateField(EMAIL)
      validateField(PASSWORD)

      return errors
    },
  })

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
        style={styles.error}
        color={shouldRenderError(field) ? 'red' : 'transparent'}
      >
        {formikProps.errors[field] || ' '}
      </ThemedText>
    )
  }

  function canSubmit(): boolean {
    for (var field of ALL_FIELDS) {
      if (!formikProps.values[field]) return false
      if (!!formikProps.errors[field]) return false
    }
    return true
  }

  return (
    <>
      <ThemedTextInput
        style={styles.input}
        borderThemeColor={
          shouldRenderError(EMAIL) ? 'red' : 'foregroundColorMuted65'
        }
        borderHoverThemeColor={
          shouldRenderError(EMAIL) ? 'red' : 'foregroundColorMuted65'
        }
        borderFocusThemeColor={
          shouldRenderError(EMAIL) ? 'red' : 'foregroundColorMuted65'
        }
        placeholder={'Email address'}
        textInputKey={`sign-in-username-input-box`}
        onChangeText={(value) => {
          formikProps.setFieldValue(EMAIL, value)
        }}
        onBlur={() => {
          formikProps.setFieldTouched(EMAIL)
        }}
        value={formikProps.values[EMAIL]}
      />
      {renderError(EMAIL)}
      <Spacer height={contentPadding} />

      <ThemedTextInput
        style={styles.input}
        borderThemeColor={
          shouldRenderError(PASSWORD) ? 'red' : 'foregroundColorMuted65'
        }
        borderHoverThemeColor={
          shouldRenderError(PASSWORD) ? 'red' : 'foregroundColorMuted65'
        }
        borderFocusThemeColor={
          shouldRenderError(PASSWORD) ? 'red' : 'foregroundColorMuted65'
        }
        placeholder={'Password (8+ charactors)'}
        textInputKey={`sign-in-password-input-box`}
        onChangeText={(value) => {
          formikProps.setFieldValue(PASSWORD, value)
        }}
        onBlur={() => {
          formikProps.setFieldTouched(PASSWORD)
        }}
        value={formikProps.values[PASSWORD]}
        secureTextEntry={true}
      />
      {renderError(PASSWORD)}

      <Spacer height={contentPadding * 2} />

      <LoginButton
        analyticsLabel="github_login_public"
        disabled={!canSubmit() || isLoggingIn}
        loading={isLoggingIn}
        onPress={() => {
          formikProps.submitForm()
        }}
        // rightIcon={{ family: 'octicon', name: 'globe' }}
        style={styles.button}
        title="Sign in"
        textProps={{
          style: {
            textAlign: 'center',
          },
        }}
      />

      <ThemedText style={styles.error} color={'red'}>
        {authError?.message}
      </ThemedText>
    </>
  )
})

export default LoginForm
