import _ from 'lodash'

// TODO(chenweilunster)
export const filterRecordHasAnyForcedValue = (
  filtersRecord: Record<string, boolean | undefined> | undefined,
) => {
  if (!filtersRecord) return false
  return Object.values(filtersRecord).some(
    (value) => typeof value === 'boolean',
  )
}

export const filterRecordWithThisValueCount = (
  filtersRecord: Record<string, boolean | undefined> | undefined,
  valueToCheck: boolean,
): number => {
  if (!filtersRecord) return 0

  return Object.values(filtersRecord).reduce(
    (total, item) => total + (item === valueToCheck ? 1 : 0),
    0,
  )
}

export function itemPassesFilterRecord<
  F extends Record<string, boolean | undefined>,
>(filtersRecord: F, value: keyof F, defaultValue: boolean) {
  if (!(filtersRecord && value)) return defaultValue

  const hasForcedFilter = filterRecordHasAnyForcedValue(filtersRecord)
  if (!hasForcedFilter) return defaultValue

  const isFilterStrict =
    hasForcedFilter &&
    filterRecordWithThisValueCount(filtersRecord, defaultValue)

  return filtersRecord[value] === !defaultValue ||
    (filtersRecord[value] !== defaultValue && isFilterStrict)
    ? !defaultValue
    : defaultValue
}

export function getFilterCountMetadata(
  filtersRecord: Record<string, boolean | undefined> | undefined,
  totalCount: number,
  defaultValue: boolean,
): { checked: number; unchecked: number; total: number } {
  if (!filtersRecord) return { checked: 0, unchecked: 0, total: totalCount }

  const keys = Object.keys(filtersRecord)

  const hasForcedFilter = filterRecordHasAnyForcedValue(filtersRecord)
  if (!hasForcedFilter) {
    return {
      checked: defaultValue ? totalCount : 0,
      unchecked: !defaultValue ? totalCount : 0,
      total: totalCount,
    }
  }

  const isFilterStrict =
    hasForcedFilter &&
    filterRecordWithThisValueCount(filtersRecord, defaultValue)

  if (isFilterStrict) {
    return keys.reduce(
      (result, key) => {
        const checked = filtersRecord[key] === defaultValue

        return {
          ...result,
          checked: checked ? result.checked + 1 : result.checked,
          unchecked: !checked ? result.unchecked + 1 : result.unchecked,
        }
      },
      { checked: 0, unchecked: 0, total: totalCount },
    )
  }

  return keys.reduce(
    (result, key) => {
      const checked =
        filtersRecord[key] === !defaultValue ? !defaultValue : defaultValue

      return {
        ...result,
        checked: checked ? result.checked : result.checked - 1,
        unchecked: !checked ? result.unchecked : result.unchecked - 1,
      }
    },
    { checked: totalCount, unchecked: totalCount, total: totalCount },
  )
}
