import { StyleSheet } from 'react-native'
import { contentPadding, normalTextSize, scaleFactor } from './variables'

export const loginStyles = StyleSheet.create({
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

  invitationLinkText: {
    fontSize: normalTextSize + 2 * scaleFactor,
    fontWeight: 'bold',
    lineHeight: normalTextSize + 4 * scaleFactor,
    textAlign: 'center',
  },

  invitation: {
    fontSize: normalTextSize + 2 * scaleFactor,
    fontWeight: 'bold',
    lineHeight: normalTextSize + 4 * scaleFactor,
    textAlign: 'center',
  },
})
