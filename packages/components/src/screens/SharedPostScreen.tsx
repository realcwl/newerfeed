import React, { useCallback } from 'react'
import { StyleSheet, View, ScrollView, Clipboard } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { ActivityIndicator } from 'react-native-web'

import { Screen } from '../components/common/Screen'
import { ThemedText } from '../components/themed/ThemedText'
import { useHistory, useParams } from '../libs/react-router'
import { Helmet } from '../libs/react-helmet-async'
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
import { delay } from '../utils/helpers/time'
import { NEWS_FEED } from '../resources/strings'
import {
  HtmlMetaType,
  normalizeHtmlDocMetaText,
} from '../utils/helpers/browser'
import { CURRENT_APP_URL } from '@devhub/core/src/utils/constants'

const COLUMN_TYPE_NEWS_FEED = 'COLUMN_TYPE_NEWS_FEED'
const RESET_COPY_ICON_MS = 1200

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
  const [copySuccess, setCopySuccess] = React.useState(false)

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

  const copyPostLinkToClipboard = useCallback(() => {
    Clipboard.setString(
      `${CURRENT_APP_URL}${RouteConfiguration.sharedPost.replace(':id', id)}`,
    )
    setCopySuccess(!copySuccess)
  }, [id, copySuccess])

  const routeToRoot = useCallback(() => {
    history.push(RouteConfiguration.root)
  }, [])

  React.useEffect(() => {
    if (copySuccess) {
      delay(RESET_COPY_ICON_MS).then(() => {
        setCopySuccess(!copySuccess)
      })
    }
  }, [copySuccess])

  const htmlDescription = normalizeHtmlDocMetaText(
    item?.text,
    HtmlMetaType.description,
  )
  const htmlTitle = normalizeHtmlDocMetaText(
    item &&
      `${item.subSource?.name.concat(':')}${
        item.title && item.title?.concat(',')
      }${htmlDescription}`,
    HtmlMetaType.title,
    NEWS_FEED,
  )

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

  const headerLeftIcon = (
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
      onPress={routeToRoot}
    />
  )

  const headerRightIcon = (
    <ThemedIcon
      color={'foregroundColor'}
      family="material"
      name={copySuccess ? 'check' : 'content-copy'}
      selectable={false}
      style={[
        {
          width: scaleFactor * 24,
          fontSize: scaleFactor * 24,
          textAlign: 'center',
        },
      ]}
      onPress={copyPostLinkToClipboard}
    />
  )

  return (
    <Screen statusBarBackgroundThemeColor="transparent" enableSafeArea={true}>
      <Helmet>
        <title>{htmlTitle}</title>
        <meta name="description" content={htmlDescription} />
      </Helmet>
      <View style={[styles.container]}>
        <PageHeader
          title="Shared Post"
          leftIcon={headerLeftIcon}
          rightIcon={headerRightIcon}
        />
        <ScrollView style={[styles.container]}>
          <Container>
            <View style={[sharedStyles.fullWidth]}>{content}</View>
          </Container>
        </ScrollView>
      </View>
    </Screen>
  )
}
