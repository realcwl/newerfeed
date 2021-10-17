import { NewsFeedDataExpressionWrapper, guid } from '@devhub/core'
import { useFormik } from 'formik'
import _ from 'lodash'
import React, { useState } from 'react'
import { View } from 'react-native'
import { Separator } from '../components/common/Separator'
import { Spacer } from '../components/common/Spacer'
import { DataExpressionEditor } from '../components/modals/partials/DataExpressionEditor'
import { useColumnCreatedByCurrentUser } from '../hooks/use-column-created-by-current-user'
import { contentPadding } from '../styles/variables'
import { isAllOf, isAnyOf, isNotTrue } from '../utils/types'

export interface DataExpressionEditorContainerProps {
  formikProps: ReturnType<typeof useFormik>
}

// Filter children expression wrappers by id. For AllOf or AnyOf, this basically
// remove that expression wrapper from the array. For NotTrue, this operation
// marks the Not True's children as a Creator expression
function FilterChildrenById(
  id: string,
  exprWrapper: NewsFeedDataExpressionWrapper,
) {
  if (!exprWrapper.expr) return
  const expr = exprWrapper.expr
  if (isAllOf(expr)) {
    const filteredExprs = _.filter(expr.allOf, (v) => v.id != id)
    exprWrapper.expr = {
      allOf: filteredExprs,
    }
  }
  if (isAnyOf(expr)) {
    const filteredExprs = _.filter(expr.anyOf, (v) => v.id != id)
    exprWrapper.expr = {
      anyOf: filteredExprs,
    }
  }
  if (isNotTrue(expr)) {
    delete expr.notTrue.expr
  }
}

// Expression Addition and Deletion are handled centrally in this top level
// container, which traverses this expression tree and find the expression to be
// added or deleted. The DataExpressionEditor component itself should focus on
// the rendering logic instead of the actual data change.
// This container also renders the 3 buttons for expression contruction, which
// are: AllOf, AnyOf, NotTrue
export const DataExpressionEditorContainer = React.memo(
  (props: DataExpressionEditorContainerProps) => {
    // If focusId is not empty string, we should render the 3 buttons.
    // focusId is set after user click any "+" icon in this editor, and before
    // entering any string. It will be unset when user lose focus on the editor
    // or submit the editor's content, or click anyOf the popped out 3 buttons.
    const [focusId, setFocusId] = useState('')

    // flush() is a special function that force flipper to flip value. This is
    // because when we're modifying some inner valye of the
    // dataExpressionWrapper, the reference will not be changed because we're
    // simply pushing some element into the array, and React won't rerender
    // itself because it does only shallow compare. We thus use flush() to
    // explicitly change the React's state, and causing a rerender of the expr.
    const [flipper, setFlipper] = useState(true)
    function flush() {
      setFlipper(!flipper)
    }

    const { formikProps } = props
    const dataExpressionWrapper: NewsFeedDataExpressionWrapper =
      formikProps.values['dataExpression']

    // Traverse the data expression in DFS order, delete the expression by id.
    // Return true if sucessfully deleted an expression, false if not found.
    function deleteExpressionById(id: string | undefined): boolean {
      if (!id) return false

      // If this is the top level expression, we should remove the expression
      // and just leave the id, so that it's converted to a creation placeholder.
      if (formikProps.values['dataExpression'].id === id) {
        formikProps.setFieldValue('dataExpression', { id })
        return true
      }

      // If the delete happens in a inner expression, we recursively try to
      // find the expression, and delete it in the parent scope.
      const deleted = deleteExpressionByIdInternal(
        id,
        dataExpressionWrapper,
        /*parentWrapper=*/ {},
      )
      if (deleted) {
        flush()
      }
      return deleted
    }

    // Recursively delete expression by id, this will be a noop if id is not
    // found. dataExpressionWrapper should only be a AllOf/AnyOf/NotTrue
    // because predicate type doesn't have any children, and should already
    // be deleted via its parent.
    function deleteExpressionByIdInternal(
      id: string,
      dataExpressionWrapper: NewsFeedDataExpressionWrapper,
      parentWrapper: NewsFeedDataExpressionWrapper,
    ): boolean {
      // Return false if the data expression is a creator expression.
      if (!dataExpressionWrapper.expr) {
        return false
      }

      if (dataExpressionWrapper.id === id) {
        FilterChildrenById(id, parentWrapper)
        return true
      }

      const expr = dataExpressionWrapper.expr

      if (isAllOf(expr)) {
        for (const innerWrapper of expr.allOf) {
          if (
            deleteExpressionByIdInternal(
              id,
              innerWrapper,
              dataExpressionWrapper,
            )
          )
            return true
        }
        return false
      }
      if (isAnyOf(expr)) {
        for (const innerWrapper of expr.anyOf) {
          if (
            deleteExpressionByIdInternal(
              id,
              innerWrapper,
              dataExpressionWrapper,
            )
          )
            return true
        }
        return false
      }
      if (isNotTrue(expr)) {
        return deleteExpressionByIdInternal(
          id,
          expr.notTrue,
          dataExpressionWrapper,
        )
      }

      return false
    }

    // Add a dataExpressionWrapper at the specified place, denoted by id. Return
    // true if added successfully, false if fail.
    function setExpressionWrapper(
      payloadWrapper: NewsFeedDataExpressionWrapper,
    ): boolean {
      // Cannot add a Creator expression directly.
      if (!payloadWrapper.expr) {
        return false
      }
      // If we're changing the top level wrapper directly, we directly modify
      // its data.
      if (dataExpressionWrapper.id === payloadWrapper.id) {
        dataExpressionWrapper.expr = payloadWrapper.expr
        return true
      }

      // Otherwise, it must be one of the children, we must find it and set it
      // correctly.
      const added = setExpressionWrapperByIdInternal(
        dataExpressionWrapper,
        payloadWrapper,
      )
      if (added) {
        flush()
      }
      return added
    }

    // Recursively find the place to added this expression. The location to add
    // the expression must be a Creator expression. Note that every expression
    // addition should automatically populate at least one Creator expression
    // for the next addition. The Creator expression within exprWrapper is
    // handled by action dispatcher, while the new Creator in the same array as
    // exprWrapper should be handled by this function.
    function setExpressionWrapperByIdInternal(
      parentWrapper: NewsFeedDataExpressionWrapper,
      payloadWrapper: NewsFeedDataExpressionWrapper,
    ): boolean {
      if (!parentWrapper.expr) return false
      const expr = parentWrapper.expr

      if (isAllOf(expr)) {
        for (const innerWrapper of expr.allOf) {
          if (innerWrapper.id === payloadWrapper.id) {
            const isCreator = !innerWrapper.expr
            innerWrapper.expr = payloadWrapper.expr
            if (isCreator) {
              expr.allOf.push({ id: guid() })
            }
            return true
          } else if (
            setExpressionWrapperByIdInternal(innerWrapper, payloadWrapper)
          ) {
            return true
          }
        }
      }
      if (isAnyOf(expr)) {
        for (const innerWrapper of expr.anyOf) {
          if (innerWrapper.id === payloadWrapper.id) {
            const isCreator = !innerWrapper.expr
            innerWrapper.expr = payloadWrapper.expr
            if (isCreator) {
              expr.anyOf.push({ id: guid() })
            }
            return true
          } else if (
            setExpressionWrapperByIdInternal(innerWrapper, payloadWrapper)
          ) {
            return true
          }
        }
      }
      if (isNotTrue(expr)) {
        if (expr.notTrue.id === payloadWrapper.id) {
          expr.notTrue.expr = payloadWrapper.expr
          return true
        }
      }

      return false
    }

    return (
      <View>
        <DataExpressionEditor
          dataExpressionWrapper={dataExpressionWrapper}
          focusId={focusId}
          setFocusId={setFocusId}
          setExpressionWrapper={setExpressionWrapper}
          deleteExpressionById={deleteExpressionById}
          disabled={
            !useColumnCreatedByCurrentUser(formikProps.values['columnId'])
          }
          disableDelete={
            !useColumnCreatedByCurrentUser(formikProps.values['columnId'])
          }
        />
        <Spacer height={contentPadding} />
        <Separator horizontal />
        <Spacer height={contentPadding} />
      </View>
    )
  },
)

DataExpressionEditorContainer.displayName = 'DataExpressionEditorContainer'
