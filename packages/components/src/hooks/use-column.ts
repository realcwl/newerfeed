import { constants, HeaderDetails } from "@devhub/core";
import _ from "lodash";
import { useCallback, useMemo } from "react";

import * as selectors from "../redux/selectors";
import { useReduxState } from "./use-redux-state";

export function useColumn(columnId: string) {
  const column = useReduxState(
    useCallback(
      (state) => selectors.columnSelector(state, columnId),
      [columnId]
    )
  );

  const columnIndex = useReduxState(selectors.columnIdsSelector).indexOf(
    columnId
  );

  const headerDetails: HeaderDetails = {
    title: column ? column.title : "",
  };

  const isOverMaxColumnLimit = !!(
    columnIndex >= 0 && columnIndex + 1 > constants.COLUMNS_LIMIT
  );

  const hasCrossedColumnsLimit = isOverMaxColumnLimit;

  const dashboardFromUsername = undefined;

  return useMemo(
    () => ({
      column,
      columnIndex,
      dashboardFromUsername,
      hasCrossedColumnsLimit,
      headerDetails,
      isOverMaxColumnLimit,
    }),
    [
      column,
      columnIndex,
      dashboardFromUsername,
      hasCrossedColumnsLimit,
      headerDetails,
      isOverMaxColumnLimit,
    ]
  );
}
