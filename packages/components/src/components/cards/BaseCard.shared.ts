import { Author, Column, constants, NewsFeedData } from '@devhub/core'
import { PixelRatio } from 'react-native'

import { Platform } from '../../libs/platform'
import { IconProp } from '../../libs/vector-icons'
import * as actions from '../../redux/actions'
import { betterMemoize } from '../../redux/selectors/helpers'
import { ExtractActionFromActionCreator } from '../../redux/types/base'
import {
  avatarSize,
  contentPadding,
  normalTextSize,
  scaleFactor,
  smallAvatarSize,
  smallerTextSize,
  smallTextSize,
} from '../../styles/variables'
import { smallLabelHeight } from '../common/Label'
import { cardActionsHeight } from './partials/CardActions'
import { cardItemSeparatorSize } from './partials/CardItemSeparator'

// since we moved plans to the server we cant get this statically anymore
// only via the usePlans hook

const _iconSize = smallAvatarSize - 4 * scaleFactor
const _iconContainerSize = smallAvatarSize
const _actionFontSize = smallerTextSize
const _subitemFontSize = smallTextSize
const _subitemLineHeight = _subitemFontSize + 2 * scaleFactor
export const sizes = {
  cardPaddingVertical: contentPadding,
  cardPaddingHorizontal: contentPadding,
  iconSize: PixelRatio.roundToNearestPixel(_iconSize),
  iconContainerSize: _iconContainerSize,
  avatarContainerWidth: PixelRatio.roundToNearestPixel(
    avatarSize + _iconContainerSize / 3,
  ),
  avatarContainerHeight: PixelRatio.roundToNearestPixel(avatarSize),
  actionContainerHeight: Math.max(_actionFontSize, smallAvatarSize),
  actionFontSize: _actionFontSize,
  subitemContainerHeight: Math.max(_subitemLineHeight, smallAvatarSize),
  subitemFontSize: _subitemFontSize,
  subitemLineHeight: _subitemLineHeight,
  githubAppMessageContainerHeight: Math.max(
    _subitemLineHeight,
    smallAvatarSize,
  ),
  horizontalSpaceSize: contentPadding / 2,
  titleLineHeight: normalTextSize * 1.2,
  subtitleLineHeight: smallerTextSize * 1.2,
  textLineHeight: smallerTextSize * 1.2,
  verticalSpaceSize: contentPadding / 2,
}

export const renderCardActions =
  Platform.OS === 'web' || constants.DISABLE_SWIPEABLE_CARDS

export interface AdditionalCardProps {
  // appViewMode: AppViewMode
  columnId: string
  height: number
}

export interface BaseCardProps extends AdditionalCardProps {
  action?: {
    avatar: {
      imageURL: string
      linkURL: string
    }
    text: string
  }
  author?: Author
  timestamp: Date
  isRead: boolean
  isSaved: boolean
  link: string
  nodeIdOrId: string
  text?: string
  title?: string
  type: Column['type']
}

function _getCardPropsForItem(
  type: string,
  item: NewsFeedData,
): Omit<BaseCardProps, keyof AdditionalCardProps> {
  return {
    title: item.title,
    type: 'COLUMN_TYPE_NEWS_FEED',
    link: '',
    isRead: item.isRead,
    isSaved: item.isSaved,
    timestamp: item.postTimestamp ?? item.crawledTimestamp,
    text: item.text,
    author: item.author,
    nodeIdOrId: item.id,
  }
}

const _memoizedGetCardPropsForItemFnByColumnId = betterMemoize(
  (_columnId: string) => (type: string, item: NewsFeedData) =>
    _getCardPropsForItem(type, item),
  undefined,
  10,
)

const _memoizedGetCardPropsForItem = betterMemoize(
  (type: string, columnId: string, item: NewsFeedData) =>
    _memoizedGetCardPropsForItemFnByColumnId(columnId)(type, item),
  undefined,
  200,
)

export function getCardPropsForItem(
  type: string,
  columnId: string,
  item: NewsFeedData,
): Omit<BaseCardProps, keyof AdditionalCardProps> &
  Pick<AdditionalCardProps, 'height'> {
  const props = _memoizedGetCardPropsForItem(type, columnId, item)
  return { ...props, height: getCardSizeForProps(props) }
}

export function getCardSizeForProps(
  props: Omit<BaseCardProps, keyof AdditionalCardProps>,
): number {
  if (!props) return 0

  return PixelRatio.roundToNearestPixel(
    sizes.cardPaddingVertical * 2 +
      Math.max(
        sizes.avatarContainerHeight,
        (props.title ? sizes.titleLineHeight : 0) +
          (props.text ? sizes.textLineHeight + sizes.verticalSpaceSize : 0),
      ) +
      (props.action && props.action.text
        ? sizes.actionContainerHeight + sizes.verticalSpaceSize
        : 0) +
      (renderCardActions ? cardActionsHeight + sizes.verticalSpaceSize : 0) +
      cardItemSeparatorSize,
  )
}

export function getCardSizeForItem(
  ...args: Parameters<typeof getCardPropsForItem>
): number {
  return getCardSizeForProps(getCardPropsForItem(...args))
}
