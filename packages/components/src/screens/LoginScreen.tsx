import React, { useEffect } from 'react'
import { Image, ScrollView, StyleSheet, View } from 'react-native'

import { constants } from '@devhub/core'
import logo from '@devhub/components/assets/logo_circle.png'

import { FullHeightScrollView } from '../components/common/FullHeightScrollView'
import { GitHubLoginButton } from '../components/common/GitHubLoginButton'
import { Link } from '../components/common/Link'
import { Screen } from '../components/common/Screen'
import { Spacer } from '../components/common/Spacer'
import { ThemedText } from '../components/themed/ThemedText'
import { useDimensions } from '../hooks/use-dimensions'
import { useLoginHelpers } from '../components/context/LoginHelpersContext'
import { analytics } from '../libs/analytics'
import { Platform } from '../libs/platform'
import {
  contentPadding,
  normalTextSize,
  scaleFactor,
} from '../styles/variables'
import { useDispatch } from 'react-redux'
import { loginSuccess } from '../redux/actions'
import { ThemedTextInput } from '../components/themed/ThemedTextInput'

const SHOW_GITHUB_GRANULAR_OAUTH_LOGIN_BUTTON =
  constants.ENABLE_GITHUB_OAUTH_SUPPORT && !Platform.isMacOS
const SHOW_GITHUB_FULL_ACCESS_LOGIN_BUTTON = false
const SHOW_GITHUB_PERSONAL_TOKEN_LOGIN_BUTTON =
  constants.ENABLE_GITHUB_PERSONAL_ACCESS_TOKEN_SUPPORT && Platform.isMacOS

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
  },

  contentContainer: {
    alignItems: 'stretch',
    alignSelf: 'center',
    justifyContent: 'center',
    padding: contentPadding,
  },

  header: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  mainContentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  footer: {
    height: normalTextSize * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    alignSelf: 'center',
    height: 80 * scaleFactor,
    marginBottom: contentPadding / 2,
    width: 80 * scaleFactor,
  },

  title: {
    fontSize: 30 * scaleFactor,
    fontWeight: 'bold',
    lineHeight: 36 * scaleFactor,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: normalTextSize + 2 * scaleFactor,
    fontWeight: '400',
    lineHeight: normalTextSize + 4 * scaleFactor,
    textAlign: 'center',
  },

  invitation: {
    fontSize: normalTextSize + 2 * scaleFactor,
    fontWeight: 'bold',
    lineHeight: normalTextSize + 4 * scaleFactor,
    textAlign: 'center',
  },

  invitationLinkText: {
    fontSize: normalTextSize + 2 * scaleFactor,
    fontWeight: 'bold',
    lineHeight: normalTextSize + 4 * scaleFactor,
    textAlign: 'center',
  },

  button: {
    alignSelf: 'stretch',
    marginTop: contentPadding / 2,
  },

  input: {
    alignSelf: 'stretch',
    marginTop: contentPadding / 2,
    height: 45 * scaleFactor,
  },

  footerLink: {},

  footerLinkText: {
    fontSize: normalTextSize,
    lineHeight: normalTextSize * 1.5,
    textAlign: 'center',
  },

  footerSeparatorText: {
    paddingHorizontal: contentPadding / 2,
    fontStyle: 'italic',
  },
})

export const LoginScreen = React.memo(() => {
  const dimensions = useDimensions('width')

  const { isLoggingIn } = useLoginHelpers()
  const dispatch = useDispatch()

  useEffect(() => {
    analytics.trackScreenView('LOGIN_SCREEN')
  }, [])

  const hasMultipleLoginButtons =
    SHOW_GITHUB_FULL_ACCESS_LOGIN_BUTTON ||
    SHOW_GITHUB_PERSONAL_TOKEN_LOGIN_BUTTON

  return (
    <Screen>
      <FullHeightScrollView
        alwaysBounceVertical={false}
        style={[
          styles.container,
          { maxWidth: Math.min(400 * scaleFactor, dimensions.width) },
        ]}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.header} />

        <View style={styles.mainContentContainer}>
          <Spacer height={contentPadding} />

          <Link
            analyticsCategory="loginscreen"
            analyticsLabel="logo"
            href={constants.DEVHUB_LINKS.GITHUB_REPOSITORY}
            openOnNewTab
            style={styles.footerLink}
            textProps={{
              color: 'foregroundColorMuted65',
              style: styles.footerLinkText,
            }}
          >
            <Image resizeMode="contain" source={logo} style={styles.logo} />
          </Link>

          <Spacer height={contentPadding} />

          <ThemedText color="foregroundColor" style={styles.title}>
            Welcome to NewsFeed
          </ThemedText>

          <Spacer height={contentPadding / 2} />

          <ThemedText color="foregroundColorMuted65" style={styles.subtitle}>
            Your personal len to the global news
          </ThemedText>

          <Spacer height={contentPadding * 2} />

          <ThemedText color="foregroundColorMuted65" style={styles.invitation}>
            {'Have invitation? '}
            <ThemedText
              onPress={() => console.log('sign up panel')}
              color="orange"
              style={styles.invitationLinkText}
            >
              Sign up
            </ThemedText>
          </ThemedText>

          <Spacer height={contentPadding} />

          <ThemedTextInput
            style={styles.input}
            borderThemeColor={'foregroundColorMuted65'}
            placeholder={'Email address'}
            borderHoverThemeColor={'foregroundColorMuted65'}
            textInputKey={`sign-in-username-input-box`}
          />

          <Spacer height={contentPadding * 2} />

          <ThemedTextInput
            style={styles.input}
            borderThemeColor={'foregroundColorMuted65'}
            placeholder={'Password (8+ charactors)'}
            borderHoverThemeColor={'foregroundColorMuted65'}
            textInputKey={`sign-in-password-input-box`}
          />

          <Spacer height={contentPadding * 2} />

          {SHOW_GITHUB_GRANULAR_OAUTH_LOGIN_BUTTON &&
            (() => {
              const subtitle = hasMultipleLoginButtons
                ? 'Granular permissions'
                : undefined

              return (
                <GitHubLoginButton
                  analyticsLabel="github_login_public"
                  disabled={isLoggingIn}
                  loading={isLoggingIn}
                  onPress={() => {
                    

                    dispatch(
                      // TODO(chenweilunster): Change this login logic to actually call backend.
                      loginSuccess({
                        appToken: 'DUMMY_APP_TOKEN',
                        user: {
                          id: 'DUMMY_USER_ID',
                          name: 'DUMMY_USER_NAME',
                          avatarUrl:
                            'https://gravatar.com/avatar/80139cbc27fcec1066bc45100d992c79?s=400&d=robohash&r=x',
                        },
                      }),
                    )
                  }}
                  // rightIcon={{ family: 'octicon', name: 'globe' }}
                  style={styles.button}
                  subtitle={subtitle}
                  textProps={{
                    style: {
                      textAlign:
                        hasMultipleLoginButtons || subtitle ? 'left' : 'center',
                    },
                  }}
                  title="Sign in"
                />
              )
            })()}
        </View>

        <Spacer height={contentPadding} />

        <View style={styles.footer}>
          <ScrollView horizontal></ScrollView>
        </View>
      </FullHeightScrollView>
    </Screen>
  )
})

LoginScreen.displayName = 'LoginScreen'
