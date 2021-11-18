import React, { useMemo, useRef, useState } from 'react'
import { FlatList, FlatListProps, View } from 'react-native'
import { useTheme } from '../../../components/context/ThemeContext'

import { sharedStyles } from '../../../styles/shared'
import { SCROLL_WAIT_MS } from '../../../utils/constants'
import { AutoSizer } from '../../auto-sizer'
import { bugsnag } from '../../bugsnag'
import { Platform } from '../../platform'
import { OneListInstance, OneListProps } from '../index.shared'

export type { OneListProps }

const renderScrollComponent = Platform.select<
  () => FlatListProps<any>['renderScrollComponent']
>({
  android: () => {
    const GestureHandlerScrollView =
      require('react-native-gesture-handler').ScrollView
    return (p: any) => <GestureHandlerScrollView {...p} nestedScrollEnabled />
  },
  default: () => undefined,
})()

export const OneList = React.memo(
  React.forwardRef<OneListInstance, OneListProps<any>>((props, ref) => {
    React.useImperativeHandle(
      ref,
      () => ({
        scrollToStart: ({ animated }: { animated?: boolean } = {}) => {
          try {
            if (!flatListRef.current) return
            flatListRef.current.scrollToOffset({ animated, offset: 0 })
          } catch (error) {
            console.error(error)
            bugsnag.notify(error as Error)
          }
        },
        scrollToEnd: ({ animated }: { animated?: boolean } = {}) => {
          try {
            if (!flatListRef.current) return
            flatListRef.current.scrollToEnd({ animated })
          } catch (error) {
            console.error(error)
            bugsnag.notify(error as Error)
          }
        },
        scrollToIndex: (index, params) => {
          try {
            if (!flatListRef.current) return

            const alignment = params ? params.alignment : 'center'

            // TODO: Implement 'smart' alignment like react-window
            flatListRef.current.scrollToIndex({
              animated: !!(params && params.animated),
              index,
              viewOffset: 0,
              viewPosition:
                alignment === 'start' ? 0 : alignment === 'end' ? 1 : 0.5,
            })
          } catch (error) {
            console.error(error)
            bugsnag.notify(error as Error)
          }
        },
      }),
      [],
    )

    const flatListRef = useRef<FlatList<any>>(null)
    const theme = useTheme()

    const {
      ListEmptyComponent,
      containerStyle,
      data,
      disableVirtualization,
      estimatedItemSize,
      footer,
      forceRerenderOnRefChange,
      getItemKey,
      getItemSize,
      header,
      horizontal,
      itemSeparator,
      listStyle,
      onVisibleItemsChanged,
      overscanCount = 1,
      pagingEnabled,
      pointerEvents,
      refreshControl,
      renderItem,
      safeAreaInsets,
      snapToAlignment,
      onReachingListEnd,
      ...restProps
    } = props

    const onVisibleItemsChangedRef = useRef(onVisibleItemsChanged)
    onVisibleItemsChangedRef.current = onVisibleItemsChanged

    const getData = () => data
    const dataRef = useRef(getData)
    dataRef.current = getData

    const getItemLayout = useMemo<
      NonNullable<FlatListProps<any>['getItemLayout']>
    >(() => {
      const lastIndex = data.length - 1

      const itemLayouts = data.reduce<
        ReturnType<NonNullable<FlatListProps<any>['getItemLayout']>>[]
      >((result, item, index) => {
        const lastItemLayout = result[result.length - 1]
        const lastOffset = (lastItemLayout && lastItemLayout.offset) || 0
        const lastLenght = (lastItemLayout && lastItemLayout.length) || 0

        result.push({
          index,
          length: getItemSize(item, index),
          offset:
            lastOffset +
            lastLenght +
            (index > 0 &&
            index < lastIndex &&
            itemSeparator &&
            itemSeparator.Component &&
            itemSeparator.size
              ? itemSeparator.size
              : 0),
        })

        return result
      }, [])

      return (_, index) => itemLayouts[index]
    }, [data, getItemSize, itemSeparator && itemSeparator.size])

    const keyExtractor: FlatListProps<any>['keyExtractor'] = getItemKey

    const onViewableItemsChanged = useMemo<
      FlatListProps<any>['onViewableItemsChanged']
    >(() => {
      return ({ viewableItems }) => {
        if (!onVisibleItemsChangedRef.current) return undefined
        const data = dataRef.current()
        const lastData = data[data.length - 1]
        if (
          footer &&
          viewableItems.find((item) => {
            return item.item == lastData
          })
        ) {
          if (onReachingListEnd) onReachingListEnd()
        }

        const visibleIndexes = viewableItems
          .filter((v) => v.isViewable && typeof v.index === 'number')
          .map((v) => v.index!)

        if (!visibleIndexes.length) onVisibleItemsChangedRef.current(-1, -1)

        onVisibleItemsChangedRef.current(
          Math.min(...visibleIndexes),
          Math.max(...visibleIndexes),
        )
      }
    }, [])

    const contentContainerStyle = useMemo<
      FlatListProps<any>['contentContainerStyle']
    >(() => {
      if (!safeAreaInsets) return undefined

      return {
        paddingTop: safeAreaInsets.top,
        paddingBottom: safeAreaInsets.bottom,
        paddingLeft: safeAreaInsets.left,
        paddingRight: safeAreaInsets.right,
      }
    }, [
      safeAreaInsets && safeAreaInsets.top,
      safeAreaInsets && safeAreaInsets.bottom,
      safeAreaInsets && safeAreaInsets.left,
      safeAreaInsets && safeAreaInsets.right,
    ])

    const viewabilityConfig = useMemo(
      () => ({
        itemVisiblePercentThreshold: 10,
      }),
      [],
    )

    return (
      <View
        pointerEvents={pointerEvents}
        style={[
          sharedStyles.flex,
          sharedStyles.fullWidth,
          sharedStyles.fullHeight,
          containerStyle,
        ]}
      >
        {header &&
        header.size > 0 &&
        header.Component &&
        (header.sticky || !data.length) ? (
          <header.Component />
        ) : null}

        <View
          style={[
            sharedStyles.flex,
            sharedStyles.fullWidth,
            sharedStyles.fullHeight,
          ]}
        >
          {data.length > 0 ? (
            <AutoSizer
              defaultWidth={0}
              defaultHeight={0}
              disableWidth={!horizontal}
              disableHeight={horizontal}
            >
              {({ width, height }) => (
                <FlatList
                  ref={flatListRef}
                  ItemSeparatorComponent={({ leadingItem }) => {
                    return (
                      <View
                        style={{
                          height: 1,
                          width: '100%',
                          backgroundColor: theme.isDark
                            ? 'rgb(10, 10, 12)'
                            : 'rgb(223, 229, 239)',
                        }}
                      />
                    )
                  }}
                  ListFooterComponent={
                    footer && footer.size > 0 && !footer.sticky
                      ? footer.Component
                      : undefined
                  }
                  onViewableItemsChanged={onViewableItemsChanged}
                  contentContainerStyle={contentContainerStyle}
                  keyExtractor={keyExtractor}
                  data={data}
                  horizontal={horizontal}
                  renderItem={renderItem}
                  onScrollToIndexFailed={(info) => {
                    const wait = new Promise((resolve) =>
                      setTimeout(resolve, SCROLL_WAIT_MS),
                    )
                    wait.then(() => {
                      flatListRef.current?.scrollToIndex({
                        index: info.index,
                        animated: false,
                        viewPosition: 0, // 0: top,  0.5: center, 1: last
                      })
                    })
                  }}
                />
              )}
            </AutoSizer>
          ) : ListEmptyComponent ? (
            <ListEmptyComponent />
          ) : null}
        </View>
      </View>
    )
  }),
) as any as (<ItemT>(
  props: OneListProps<ItemT> & React.RefAttributes<OneListInstance>,
) => React.ReactElement) & {
  displayName: string
} & OneListInstance

OneList.displayName = 'OneList'

const onScrollToIndexFailed: NonNullable<
  FlatListProps<string>['onScrollToIndexFailed']
> = (info) => {
  console.error(info)
  bugsnag.notify({
    name: 'ScrollToIndexFailed',
    message: 'Failed to scroll to index',
    ...info,
  })
}
