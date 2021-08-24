import React from 'react'
import { useDispatch } from 'react-redux'
import { Spacer } from '../components/common/Spacer'
import { ThemedText } from '../components/themed/ThemedText'
import { useReduxState } from '../hooks/use-redux-state'
import { loginStyles } from '../styles/loginStyles'
import { contentPadding } from '../styles/variables'
import * as selectors from '../redux/selectors'
import * as Yup from 'yup'
import { FormikErrors, useFormik } from 'formik'
import { clearAuthError, signUpRequest } from '../redux/actions'
import SingleTextInputWithErrorMsg from '../components/auth/TextInputWithErrorMessage'
import { LoginButton } from '../components/common/LoginButton'
import { useLoginHelpers } from '../components/context/LoginHelpersContext'

const EMAIL = 'email'
const PASSWORD = 'password'
const CONFIRMATION = 'confirmation'
const ALL_FIELDS = [EMAIL, PASSWORD, CONFIRMATION]

export interface SignupFormProps {
  onPress: () => void
}

export const SignupForm = React.memo((props: SignupFormProps) => {
  const { isLoggingIn } = useLoginHelpers()

  const dispatch = useDispatch()
  const authError = useReduxState(selectors.authErrorSelector)
  const signUpSuccessMsg = useReduxState(selectors.signUpSuccessMsgSelector)

  const formInitialValues: Record<string, string> = {
    email: '',
    password: '',
    confirmation: '',
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
    confirmation: Yup.string().oneOf(
      [Yup.ref('password'), null],
      'Passwords must match',
    ),
  }

  const formikProps = useFormik({
    initialValues: formInitialValues,
    validationSchema: Yup.object(formValidationSchema),
    onSubmit(formValues, formikActions) {
      // Indicate that we're logining in.
      dispatch(
        signUpRequest({
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

  return (
    <>
      <ThemedText color="foregroundColorMuted65" style={loginStyles.invitation}>
        {'Already have account? '}
        <ThemedText
          onPress={() => {
            dispatch(clearAuthError())
            props.onPress()
          }}
          color="orange"
          style={loginStyles.invitationLinkText}
        >
          Log in
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

      <Spacer height={contentPadding} />

      <SingleTextInputWithErrorMsg
        formikProps={formikProps}
        field={CONFIRMATION}
        placeholder={'Confirm password'}
        textInputKey={'sign-in-password-input-box'}
        secureTextEntry={true}
      />

      {signUpSuccessMsg ? (
        <ThemedText style={loginStyles.error} color={'green'}>
          {signUpSuccessMsg}
        </ThemedText>
      ) : (
        <>
          <Spacer height={contentPadding * 2} />
          <LoginButton
            analyticsLabel="newsfeed"
            disabled={!canSubmit() || isLoggingIn}
            loading={isLoggingIn}
            onPress={() => {
              dispatch(clearAuthError())
              formikProps.submitForm()
            }}
            style={loginStyles.button}
            title="Sign up"
            textProps={{
              style: {
                textAlign: 'center',
              },
            }}
          />
        </>
      )}

      <ThemedText style={loginStyles.error} color={'red'}>
        {authError?.message}
      </ThemedText>
    </>
  )
})

export default SignupForm
