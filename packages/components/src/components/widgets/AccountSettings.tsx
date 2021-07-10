import React from 'react'
import { View } from 'react-native'

import { sharedStyles } from '../../styles/shared'
import { contentPadding, scaleFactor } from '../../styles/variables'
import { Avatar } from '../common/Avatar'
import { Link } from '../common/Link'
import { Spacer } from '../common/Spacer'
import { SubHeader } from '../common/SubHeader'
import { ThemedText } from '../themed/ThemedText'

export interface AccountSettingsProps {}

// TODO(chenweilunster): We probably also want to have account settings. But this isn't
// planned in the first stage and I'm leaving it here just for reference.
export function AccountSettings() {
  return (
    <View>
      <SubHeader title="Account" />

      <View
        style={[
          sharedStyles.horizontal,
          sharedStyles.alignItemsCenter,
          {
            paddingHorizontal: contentPadding,
          },
        ]}
      >
        <Avatar size={28 * scaleFactor} username={'username'} />
        <Spacer width={contentPadding / 2} />
        <ThemedText color="foregroundColor">Logged in as </ThemedText>
        <Link
          href={`https://github.com`}
          textProps={{
            color: 'foregroundColor',
            style: { fontWeight: 'bold' },
          }}
        >
          {'username'}
        </Link>
      </View>
    </View>
  )
}
