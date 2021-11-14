import React, { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, View } from 'react-native'

import { FullHeightScrollView } from '../components/common/FullHeightScrollView'
import { Link } from '../components/common/Link'
import { Screen } from '../components/common/Screen'
import { Spacer } from '../components/common/Spacer'
import { ThemedText } from '../components/themed/ThemedText'
import { useDimensions } from '../hooks/use-dimensions'
import { analytics } from '../libs/analytics'
import { Helmet } from '../libs/react-helmet-async'
import {
  contentPadding,
  normalTextSize,
  scaleFactor,
} from '../styles/variables'
import _ from 'lodash'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import logo from '@devhub/components/assets/logo_circle.png'
import { LOG_IN_OR_SIG_UP, NEWS_FEED_DESCRIPTION } from '../resources/strings'

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

  useEffect(() => {
    analytics.trackScreenView('LOGIN_SCREEN')
  }, [])

  // When user clicks Sign Up button, show sign up form instead of login form.
  const [showSignup, setShowSignup] = useState(false)

  return (
    <Screen>
      <Helmet>
        <title>{LOG_IN_OR_SIG_UP}</title>
        <meta name="description" content={NEWS_FEED_DESCRIPTION} />
      </Helmet>
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
            openOnNewTab
            disabled={true}
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

          {showSignup ? (
            <SignupForm onPress={() => setShowSignup(false)} />
          ) : (
            <LoginForm onPress={() => setShowSignup(true)} />
          )}
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
