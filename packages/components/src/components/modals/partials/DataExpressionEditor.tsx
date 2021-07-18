import { NewsFeedDataExpressionWrapper, guid } from '@devhub/core'
import { useFormik } from 'formik'
import React, { Children, useState } from 'react'
import { View } from 'react-native-web'
import { sharedStyles } from '../../../styles/shared'
import { contentPadding, scaleFactor } from '../../../styles/variables'
import { columnHeaderItemContentSize } from '../../columns/ColumnHeader'
import { H3 } from '../../common/H3'
import { Spacer } from '../../common/Spacer'
import { StyleSheet } from 'react-native'
import { ThemedIcon } from '../../themed/ThemedIcon'
import { isAllOf, isAnyOf, isNotTrue } from '../../../utils/types'
import { IconButton } from '../../common/IconButton'
import { renderButtonByTextAndKey } from './LogicalExpressionButtons'

// All color combinations.
// TODO(chenweilunster): Put this into a shared place if this color is needed in
// other places.
const LINE_COLOR = '#B2B1B9'

export interface DataExpressionEditorProps {
  dataExpressionWrapper: NewsFeedDataExpressionWrapper
  setFocusId: (id: string) => void
  deleteExpressionById: (id: string | undefined) => boolean
  addExpressionWrapper: (payload: NewsFeedDataExpressionWrapper) => boolean
}

// Before rendering anything, render a dashline in relative position to denote
// that we are entering a sub expression.
// e.g. instead of rendering
// "  A"
// render
// "- A"
export const ExpressionEntryIndicator = (props: {
  width: number
  children: React.ReactNode
}) => {
  return (
    <View style={sharedStyles.horizontal}>
      <View
        style={{
          borderTopColor: LINE_COLOR,
          borderTopWidth: 1,
          top: 10,
          width: 10,
        }}
      />
      <Spacer width={10} />
      <View>{props.children}</View>
    </View>
  )
}

export const DataExpressionEditor = React.memo(
  (props: DataExpressionEditorProps) => {
    const {
      dataExpressionWrapper,
      deleteExpressionById,
      setFocusId,
      addExpressionWrapper,
    } = props
    if (!dataExpressionWrapper || !dataExpressionWrapper.id) return null

    const expressionId: string = dataExpressionWrapper.id

    // This is a Creator expression, we should render it as a plus button, and
    // bind it with the creation callback as well as onFocus callback.
    if (!dataExpressionWrapper.expr) {
      return (
        <IconButton
          color="green"
          family="material"
          name={'add-circle'}
          size={18 * scaleFactor}
          onPress={() => {
            console.log('pressed add')
            setFocusId(expressionId)
          }}
        />
      )
    }

    function renderHeader(exprWrapper: NewsFeedDataExpressionWrapper) {
      // Return no header is the expression is undefined.
      if (!exprWrapper.expr) {
        return undefined
      }

      let headerComponent = undefined
      if (isAllOf(exprWrapper.expr)) {
        headerComponent = renderButtonByTextAndKey({
          text: 'AllOf',
          color: 'yellow',
          disabled: true,
          onDelete: () => deleteExpressionById(exprWrapper.id),
        })
      } else if (isAnyOf(exprWrapper.expr)) {
        headerComponent = renderButtonByTextAndKey({
          text: 'AnyOf',
          color: 'green',
          disabled: true,
          onDelete: () => deleteExpressionById(exprWrapper.id),
        })
      } else if (isNotTrue(exprWrapper.expr)) {
        headerComponent = renderButtonByTextAndKey({
          text: 'Not',
          color: 'lightRed',
          disabled: true,
          onDelete: () => deleteExpressionById(exprWrapper.id),
        })
      }

      return (
        <View style={[sharedStyles.flex, sharedStyles.horizontal]}>
          {headerComponent}
        </View>
      )
    }

    let content = undefined
    if (isAllOf(dataExpressionWrapper.expr)) {
      content = dataExpressionWrapper.expr.allOf.map((exprWrapper) => {
        return (
          <ExpressionEntryIndicator
            width={columnHeaderItemContentSize / 3}
            key={`data-expression-editor-allof-${guid()}`}
          >
            <DataExpressionEditor
              dataExpressionWrapper={exprWrapper}
              deleteExpressionById={deleteExpressionById}
              setFocusId={setFocusId}
              addExpressionWrapper={addExpressionWrapper}
            />
            <Spacer height={contentPadding / 2} />
          </ExpressionEntryIndicator>
        )
      })
    } else if (isAnyOf(dataExpressionWrapper.expr)) {
      content = dataExpressionWrapper.expr.anyOf.map((exprWrapper) => {
        return (
          <ExpressionEntryIndicator
            width={columnHeaderItemContentSize / 3}
            key={`data-expression-editor-anyof-${guid()}`}
          >
            <DataExpressionEditor
              dataExpressionWrapper={exprWrapper}
              deleteExpressionById={deleteExpressionById}
              setFocusId={setFocusId}
              addExpressionWrapper={addExpressionWrapper}
            />
            <Spacer height={contentPadding / 2} />
          </ExpressionEntryIndicator>
        )
      })
    } else if (isNotTrue(dataExpressionWrapper.expr)) {
      content = (
        <ExpressionEntryIndicator width={columnHeaderItemContentSize / 3}>
          <DataExpressionEditor
            dataExpressionWrapper={dataExpressionWrapper.expr.notTrue}
            deleteExpressionById={deleteExpressionById}
            setFocusId={setFocusId}
            addExpressionWrapper={addExpressionWrapper}
          />
          <Spacer height={contentPadding / 2} />
        </ExpressionEntryIndicator>
      )
    } else {
      // Handling Predicate Type.
      return renderButtonByTextAndKey({
        text: dataExpressionWrapper.expr?.param || '',
        disabled: false,
        color: 'gray',
        onDelete: () => deleteExpressionById(dataExpressionWrapper.id),
      })
    }

    return (
      <View>
        {renderHeader(dataExpressionWrapper)}
        <Spacer height={contentPadding / 2} />
        <View style={sharedStyles.horizontal}>
          <View
            style={{
              borderColor: LINE_COLOR,
              borderRightWidth: 1,
              marginLeft: columnHeaderItemContentSize * 1,
            }}
          >
            <H3>{null}</H3>
          </View>
          <View>{content}</View>
        </View>
      </View>
    )
  },
)

DataExpressionEditor.displayName = 'DataExpressionEditor'
