import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { ActivityIndicator } from 'react-native-web'

import { Screen } from '../components/common/Screen'
import { ThemedText } from '../components/themed/ThemedText'
import { useHistory, useParams } from '../libs/react-router'
import {
  RouteConfiguration,
  RouteParamsSharedPost,
} from '../navigation/AppNavigator'
import { useItem } from '../hooks/use-item'
import { getCardPropsForItem } from '../components/cards/BaseCard.shared'
import { BaseCard } from '../components/cards/BaseCard'
import { PageHeader } from '../components/common/PageHeader'
import { Container } from '../components/common/Container'
import { sharedStyles } from '../styles/shared'
import { scaleFactor } from '../styles/variables'
import { ThemedIcon } from '../components/themed/ThemedIcon'
import * as actions from '../redux/actions'
import * as selectors from '../redux/selectors'
import { RootState } from '../redux/types'

const COLUMN_TYPE_NEWS_FEED = 'COLUMN_TYPE_NEWS_FEED'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'row',
  },
})

export const SharedPostScreen = () => {
  const { id } = useParams<RouteParamsSharedPost>()
  const dispatch = useDispatch()
  const history = useHistory()
  const item = useItem(id)
  const loading = useSelector((state: RootState) =>
    selectors.dataLoadingSelector(state, id),
  )

  React.useEffect(() => {
    if (item == null) {
      dispatch(actions.fetchPost({ id }))
    }
  }, [id, item])

  const { CardComponent, cardProps } = React.useMemo(() => {
    if (!item) {
      return {}
    }

    const _cardProps = getCardPropsForItem(COLUMN_TYPE_NEWS_FEED, '', item)

    return {
      cardProps: _cardProps,
      CardComponent: (
        <BaseCard
          key={`${COLUMN_TYPE_NEWS_FEED}-base-card-${id}`}
          {..._cardProps}
          columnId={''}
          shareMode={true}
        />
      ),
    }
  }, [id, item])

  let content

  if (id == null || id === '') {
    content = (
      <ThemedText color="foregroundColorMuted65">missing post id</ThemedText>
    )
  } else if (loading) {
    content = (
      <View style={{ marginTop: '40vh' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  } else if (item == null) {
    content = (
      <ThemedText color="foregroundColorMuted65">no such item</ThemedText>
    )
  } else {
    content = CardComponent
  }

  const headerIcon = (
    <ThemedIcon
      color={'foregroundColor'}
      family="material"
      name="home"
      selectable={false}
      style={[
        {
          width: scaleFactor * 24,
          fontSize: scaleFactor * 24,
          textAlign: 'center',
        },
      ]}
      onPress={() => history.push(RouteConfiguration.root)}
    />
  )

  return (
    <Screen statusBarBackgroundThemeColor="transparent" enableSafeArea={true}>
      <View style={[styles.container, sharedStyles.overflowScroll]}>
        <PageHeader title="Shared Post" icon={headerIcon} />
        <View style={[styles.container]}>
          <Container>
            <View style={[sharedStyles.fullWidth]}>{content}</View>
          </Container>
        </View>
      </View>
    </Screen>
  )
}
