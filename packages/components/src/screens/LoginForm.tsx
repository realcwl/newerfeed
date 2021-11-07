import { FormikErrors, useFormik } from 'formik'
import React from 'react'
import { useDispatch } from 'react-redux'
import { LoginButton } from '../components/common/LoginButton'
import { Spacer } from '../components/common/Spacer'
import { useLoginHelpers } from '../components/context/LoginHelpersContext'
import { clearAuthError, loginRequest } from '../redux/actions'
import { contentPadding } from '../styles/variables'
import * as Yup from 'yup'
import { ThemedText } from '../components/themed/ThemedText'
import * as selectors from '../redux/selectors'
import { useReduxState } from '../hooks/use-redux-state'
import { loginStyles } from '../styles/loginStyles'
import SingleTextInputWithErrorMsg from '../components/auth/TextInputWithErrorMessage'
import { useHistory } from '../libs/react-router'
import { RouteConfiguration } from '../navigation/AppNavigator'

const EMAIL = 'email'
const PASSWORD = 'password'
const ALL_FIELDS = [EMAIL, PASSWORD]

export interface LoginFormProps {
  onPress: () => void
}

export const LoginForm = React.memo((props: LoginFormProps) => {
  const { isLoggingIn } = useLoginHelpers()
  const dispatch = useDispatch()
  const authError = useReduxState(selectors.authErrorSelector)
  const user = useReduxState(selectors.currentUserSelector)
  const history = useHistory()

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

  function canSubmit(): boolean {
    for (const field of ALL_FIELDS) {
      if (!formikProps.values[field]) return false
      if (!!formikProps.errors[field]) return false
    }
    return true
  }

  React.useEffect(() => {
    if (user) {
      history.push(RouteConfiguration.root)
    }
  }, [user])

  return (
    <>
      <ThemedText color="foregroundColorMuted65" style={loginStyles.invitation}>
        {'Have invitation? '}
        <ThemedText
          onPress={() => {
            dispatch(clearAuthError())
            props.onPress()
          }}
          color="orange"
          style={loginStyles.invitationLinkText}
        >
          Sign up
        </ThemedText>
      </ThemedText>

      <Spacer height={contentPadding} />

      <SingleTextInputWithErrorMsg
        formikProps={formikProps}
        field={EMAIL}
        placeholder={'Email address'}
        textInputKey={'sign-in-username-input-box'}
      />

      <Spacer height={contentPadding} />

      <SingleTextInputWithErrorMsg
        formikProps={formikProps}
        field={PASSWORD}
        placeholder={'Password (8+ charactors)'}
        textInputKey={'sign-in-password-input-box'}
        secureTextEntry={true}
      />

      <Spacer height={contentPadding * 2} />

      <LoginButton
        analyticsLabel="newsfeed"
        disabled={!canSubmit() || isLoggingIn}
        loading={isLoggingIn}
        onPress={() => {
          formikProps.submitForm()
        }}
        style={loginStyles.button}
        title="Sign in"
        textProps={{
          style: {
            textAlign: 'center',
          },
        }}
      />

      <ThemedText style={loginStyles.error} color={'red'}>
        {authError?.message}
      </ThemedText>
    </>
  )
})

export default LoginForm
