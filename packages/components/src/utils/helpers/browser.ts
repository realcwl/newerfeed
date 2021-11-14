import { Platform } from '../../libs/platform'
import {
  MAX_HTML_DESCRIPTION_LENGTH,
  MAX_HTML_TITLE_LENGTH,
} from '../constants'

/**
 * stripHtmlTag removes html tags from a given string. For browser
 * environment, use its parser as the preferred solution. Otherwise
 * use regex as a light none-perfect solution.
 */
export const stripHtmlTag = (s: string | undefined): string => {
  if (s == null || s === '') return ''
  if (Platform.OS == 'web') {
    // use browser's parser
    const div = document.createElement('div')
    div.innerHTML = s
    return div.textContent || div.innerText || ''
  }
  // https://code-boxx.com/strip-remove-html-tags-javascript/
  return s.replace(/(&lt;([^>]+)>)/gi, '')
}

/**
 * normalizeStringForHtmlMeta limit the length of string and remove
 * undesired characters like '\n'.
 * @param s
 * @param limit
 * @returns
 */
export const normalizeStringForHtmlMeta = (
  s: string | undefined,
  limit?: number,
): string => {
  if (s == null || s === '') return ''
  let res = s && `${s.replace(/\n/g, '')}`
  if (limit && res.length > limit) {
    res = res.substring(0, limit)
    res = `${res}...`
  }
  return res
}

export enum HtmlMetaType {
  title = 'title',
  description = 'description',
}

const HtmlMetaTypeLengthMap = {
  [HtmlMetaType.title]: MAX_HTML_TITLE_LENGTH,
  [HtmlMetaType.description]: MAX_HTML_DESCRIPTION_LENGTH,
}

export const normalizeHtmlDocMetaText = (
  s: string | undefined,
  type: HtmlMetaType,
  fallback?: string,
) => {
  return (
    normalizeStringForHtmlMeta(stripHtmlTag(s), HtmlMetaTypeLengthMap[type]) ||
    fallback ||
    ''
  )
}
