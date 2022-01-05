import { useDispatch } from 'react-redux'
import { useFormik } from 'formik'
import { Screen } from '../components/common/Screen'
import { Helmet } from '../libs/react-helmet-async'
import { View, ScrollView } from 'react-native'
import { TextInput } from '../components/common/TextInput'
import { Spacer } from '../components/common/Spacer'
import { HeaderMessage } from '../components/common/HeaderMessage'
import { ThemedText } from '../components/themed/ThemedText'
import { Button } from '../components/common/Button'
import { Checkbox } from '../components/common/Checkbox'
import { Container, ScreenBreakpoints } from '../components/common/Container'
import { sharedStyles } from '../styles/shared'
import { TagToken } from '../components/common/TagToken'
import { contentPadding, scaleFactor } from '../styles/variables'
import {
  tryCustomizedCrawler,
  addCustomizedSource,
  addCustomizedSubSource,
  tryCustomizedCrawlerTerminate,
  addCustomizedCrawlerTerminate,
  fetchCustomizedSubsources,
  deleteCustomizedSubSource,
} from '../redux/actions'
import { useReduxState } from '../hooks/use-redux-state'
import * as Yup from 'yup'

import * as selectors from '../redux/selectors'
import { constants, TryCustomizedCrawlerPost } from '@devhub/core'
import { theme } from '@devhub/core/src/styles/themes/dark-black'
import React from 'react'

const ISTRYING = 'isTrying'
const SUBSOURCENAME = 'subSourceName'
const SUBSOURCEPARENTSOURCEID = 'subSourceParentSourceId'
const SOURCENAME = 'sourceName'
const STARTURL = 'startUrl'
const BASE = 'base'
const TITLE = 'title'
const CONTENT = 'content'
const EXTERNALID = 'externalId'
const TIME = 'time'
const IMAGE = 'image'
const POSTURL = 'postUrl'

// Currently there is only need to add source
// Add new navigation if we want to turne on adding source
export interface AddSourceOrSubsource {
  isAddingSource: boolean
}

export const AddSourceOrSubsourceScreen = React.memo(
  (props: AddSourceOrSubsource) => {
    const dispatch = useDispatch()
    const target = props.isAddingSource ? 'Source' : 'Sub Source'

    React.useEffect(() => {
      dispatch(fetchCustomizedSubsources({}))
    }, [])

    const tryCrawlerStatus = useReduxState(
      selectors.tryCustomizedCrawlerStatusSelector,
    )

    const tryCrawlerErrorMsg = useReduxState(
      selectors.tryCustomizedCrawlerErrorMsgSelector,
    )

    const tryCustomizedCrawlerPosts = useReduxState(
      selectors.tryCustomizedCrawlerPostsSelector,
    )

    const addCustomizedSourceStatus = useReduxState(
      selectors.addSourceStatusSelector,
    )

    const addCustomizedSourceErrorMsg = useReduxState(
      selectors.addSourceErrorMsgSelector,
    )

    const addedCustomizedSource = useReduxState(
      selectors.addedCustomizedSourceSelector,
    )

    const idToSourceOrSubSourceMap = useReduxState(
      selectors.idToSourceOrSubSourceMapSelector,
    )

    const availableNewsFeedSources = useReduxState(
      selectors.availableNewsFeedSourcesSelector,
    )

    const availableCustomizedSubSourcesIds = useReduxState(
      selectors.availableCustomizedSubSourcesIdsSelector,
    )

    const getWarningMsg = () => {
      if (addCustomizedSourceStatus === constants.AddSourceStatus.Failed) {
        return addCustomizedSourceErrorMsg
      }
      if (tryCrawlerStatus === constants.TryCustomizedCrawlerStatus.Failed) {
        return tryCrawlerErrorMsg
      }
      if (
        addCustomizedSourceStatus === constants.AddSourceStatus.Loaded &&
        addedCustomizedSource.id != ''
      ) {
        return `Successfully upserted  ${addedCustomizedSource.name}, id ${addedCustomizedSource.id}`
      }
      return null
    }

    const getDefaultSourceId = (): string => {
      if (availableNewsFeedSources) {
        for (let i = 0; i < availableNewsFeedSources.length; i++) {
          if (
            idToSourceOrSubSourceMap[availableNewsFeedSources[i].sourceId]
              .name === '公司博客'
          ) {
            return availableNewsFeedSources[i].sourceId
          }
        }
        if (availableNewsFeedSources.length > 0) {
          return availableNewsFeedSources[0].sourceId
        }
      }
      return ''
    }

    const sourceSchema = Yup.object().shape({
      sourceName: Yup.string().required('Required'),
    })

    const subsourceSchema = Yup.object().shape({
      subSourceName: Yup.string().required('Required'),
      subSourceParentSourceId: Yup.string().required('Required'),
      startUrl: Yup.string().url().required('Required'),
      base: Yup.string().required('Required'),
      content: Yup.string().required('Required'),
    })

    const formik = useFormik({
      initialValues: {
        // for try out
        isTrying: true,

        // for add subsource
        subSourceName: '',
        subSourceParentSourceId: getDefaultSourceId(),

        // for add source
        sourceName: '',

        // common
        startUrl: '',
        base: '',
        title: '',
        content: '',
        externalId: '',
        time: '',
        image: '',
        postUrl: '',
        postUrlIsRelativePath: false,
      },
      validationSchema: props.isAddingSource ? sourceSchema : subsourceSchema,
      validateOnChange: false,
      onSubmit: (values) => {
        if (values.isTrying) {
          dispatch(
            tryCustomizedCrawler({
              customizedCrawlerSpec: {
                ...values,
              },
            }),
          )
        } else if (props.isAddingSource) {
          dispatch(
            addCustomizedSource({
              sourceName: values.sourceName,
              customizedCrawlerSpec: {
                ...values,
              },
            }),
          )
        } else {
          dispatch(
            addCustomizedSubSource({
              subSourceName: values.subSourceName,
              subSourceParentSourceId: values.subSourceParentSourceId,
              customizedCrawlerSpec: {
                ...values,
              },
            }),
          )
        }
      },
    })

    const displayTryResponse = (
      tryCustomizedCrawlerPosts: TryCustomizedCrawlerPost[],
    ) => {
      return (
        <View>
          <Spacer height={contentPadding} />
          <HeaderMessage>Crawled Result Preview</HeaderMessage>
          <Spacer height={contentPadding} />
          {tryCustomizedCrawlerPosts &&
            tryCustomizedCrawlerPosts.map((post, index) => {
              return (
                <View key={index} style={[sharedStyles.fullWidth]}>
                  <ThemedText
                    color="foregroundColor"
                    style={[sharedStyles.largeText]}
                  >
                    <b>Index:</b> {index}
                  </ThemedText>
                  <ThemedText
                    color="foregroundColor"
                    style={[sharedStyles.largeText]}
                  >
                    <b>Title:</b> {post.title}
                  </ThemedText>
                  <ThemedText
                    color="foregroundColor"
                    style={[sharedStyles.largeText]}
                  >
                    <b>Content:</b> {post.content}
                  </ThemedText>
                  <ThemedText
                    color="foregroundColor"
                    style={[sharedStyles.largeText]}
                  >
                    <b>Origin Url:</b> {post.originUrl}
                  </ThemedText>
                  <ThemedText
                    color="foregroundColor"
                    style={[sharedStyles.largeText]}
                  >
                    <b>Images:</b> {post.images.join(', ')}
                  </ThemedText>
                  <ThemedText
                    color="foregroundColor"
                    style={[sharedStyles.largeText]}
                  >
                    <b>Element Html:</b> {post.baseHtml}
                  </ThemedText>
                  <Spacer height={contentPadding} />
                </View>
              )
            })}
        </View>
      )
    }

    const sourceForm = () => {
      return (
        <View>
          <HeaderMessage>{'Add New ' + target}</HeaderMessage>
          <Spacer height={contentPadding} />
          {getTextInput(formik, 'Name of the Source', '', 'sourceName')}
        </View>
      )
    }

    const subSourceForm = () => {
      return (
        <View>
          <HeaderMessage>{'Add New ' + target}</HeaderMessage>
          <Spacer height={contentPadding} />
          <ThemedText color="foregroundColor" style={[sharedStyles.largeText]}>
            Add into this Source
          </ThemedText>
          <View>
            <select
              name="Source"
              style={{ width: '200px' }}
              value={formik.values.subSourceParentSourceId}
              onChange={(v) => {
                reset()
                formik.setFieldValue('subSourceParentSourceId', v.target.value)
              }}
            >
              {availableNewsFeedSources &&
                availableNewsFeedSources.map((source, index) => {
                  return (
                    <option
                      key={index}
                      value={source.sourceId}
                      label={idToSourceOrSubSourceMap[source.sourceId].name}
                    />
                  )
                })}
            </select>
          </View>
          {getTextInput(formik, 'Name of the Sub Source', '', 'subSourceName')}
        </View>
      )
    }

    const reset = () => {
      dispatch(tryCustomizedCrawlerTerminate({}))
      dispatch(addCustomizedCrawlerTerminate({}))
    }

    const getTextInput = (
      formik: any,
      lable: string,
      hint: string,
      field: string,
    ) => {
      return (
        <View>
          <Spacer height={contentPadding} />
          <ThemedText color="foregroundColor" style={[sharedStyles.largeText]}>
            {lable}
          </ThemedText>
          <TextInput
            placeholder={hint}
            onChangeText={(v) => {
              reset()
              formik.setFieldValue(field, v)
            }}
            value={formik.getFieldProps(field).value}
            textInputKey={field + '-input'}
          ></TextInput>
          <ThemedText color="red" style={[sharedStyles.largeText]}>
            {formik.getFieldMeta(field).error}
          </ThemedText>
        </View>
      )
    }

    const getListForDeletion = () => {
      return (
        <View style={[sharedStyles.fullWidth]}>
          {availableCustomizedSubSourcesIds &&
            availableCustomizedSubSourcesIds.map((subSourceId, index) => {
              return (
                <View key={index} style={{ width: '100%' }}>
                  <Spacer height={contentPadding} />
                  <View style={{ flexDirection: 'row' }}>
                    <TagToken
                      label={'Delete'}
                      colors={{
                        backgroundThemeColor: theme.isDark
                          ? 'blueGray'
                          : undefined,
                        foregroundThemeColor: theme.isDark ? 'white' : 'black',
                        foregroundHoverThemeColor: theme.isDark
                          ? 'white'
                          : 'black',
                      }}
                      onPress={() => {
                        dispatch(
                          deleteCustomizedSubSource({
                            id: subSourceId,
                          }),
                        )
                      }}
                      size={20 * scaleFactor}
                    />
                    <ThemedText
                      color="foregroundColor"
                      style={{ textAlign: 'center' }}
                      onPress={() => {
                        const subsource = idToSourceOrSubSourceMap[subSourceId]
                        const config = subsource.customizedCrawlConfig
                        formik.setFieldValue('startUrl', config?.startUrl)
                        formik.setFieldValue('base', config?.base)
                        formik.setFieldValue('title', config?.title)
                        formik.setFieldValue('content', config?.content)
                        formik.setFieldValue('externalId', config?.externalId)
                        formik.setFieldValue('time', config?.time)
                        formik.setFieldValue('image', config?.image)
                        formik.setFieldValue('postUrl', config?.postUrl)
                        formik.setFieldValue(
                          'postUrlIsRelativePath',
                          config?.postUrlIsRelativePath,
                        )
                        formik.setFieldValue('subSourceName', subsource.name)
                        formik.setFieldValue(
                          'subSourceParentSourceId',
                          subsource.parentSourceId,
                        )
                      }}
                    >
                      {idToSourceOrSubSourceMap[subSourceId]
                        ? idToSourceOrSubSourceMap[subSourceId].name
                        : 'subsource id not found'}
                    </ThemedText>
                  </View>
                </View>
              )
            })}
        </View>
      )
    }

    return (
      <Screen statusBarBackgroundThemeColor="transparent" enableSafeArea={true}>
        <Helmet>
          <title>
            Add New {props.isAddingSource ? 'Source' : 'SubSource'} to crawl
          </title>
          <meta name="description" content="" />
        </Helmet>
        <ScrollView style={{ flex: 1 }}>
          <Container style={{ flex: 1 }} breakpoint={ScreenBreakpoints.md}>
            <View style={[sharedStyles.fullWidth]}>
              <ThemedText color="foregroundColor">
                如何使用 customized crawler?
                <br />
                1.选择需要添加的source
                <br />
                2.指定subsource的名字
                <br />
                3.指定爬虫开始的页面网址
                <br />
                4.爬虫对于该页面会爬取多个Post(最终每个Post会成为newsfeed里的一条新闻),
                用 Base Selector来输入一个jquery
                path，所有满足该jquery的所有页面元素都会成为一个Post，其他jquery都是在这个post内部。
                jquery selector语法参考
                https://www.w3schools.com/jquery/jquery_ref_selectors.asp
                <br />
                5.用Title等selector来指定相对于Base selector的jquery
                path，来提取每条新闻的详细信息 <br />
                6.点击 Try Crawler
                来测试效果，爬虫的结果或错误信息会显示在本页面最下方 <br />
                7.检查对爬虫结果满意点击 Add Sub Source
                来提交至后台，默认的爬虫频率为5分钟一次，爬虫会自动进行基于内容的去重{' '}
                <br />
                (*为选填项目)
                <br />
              </ThemedText>
              <HeaderMessage>All Customize Subsources</HeaderMessage>
              {getListForDeletion()}
              <Spacer height={contentPadding} />
              {props.isAddingSource ? sourceForm() : subSourceForm()}
              <Spacer height={contentPadding} />
              <HeaderMessage>Define Customize crawler</HeaderMessage>

              {getTextInput(
                formik,
                'Crawler Start Page',
                'eg: https://www.cls.cn/telegraph',
                STARTURL,
              )}
              {getTextInput(
                formik,
                'Base Selector to each Post',
                'eg: .telegraph-list',
                BASE,
              )}
              {getTextInput(
                formik,
                'Content Selector',
                'eg: .telegraph-content-box span:not(.telegraph-time-box))',
                CONTENT,
              )}
              {getTextInput(
                formik,
                '*Title selector',
                'eg: .telegraph-content-box span:not(.telegraph-time-box) > strong)',
                TITLE,
              )}
              {getTextInput(formik, '*External ID Selector', '', EXTERNALID)}
              {getTextInput(formik, '*Time Selector', '', TIME)}
              {getTextInput(formik, '*Image Selector', '', IMAGE)}
              {getTextInput(formik, '*Post URL Selector', '', POSTURL)}
              <Checkbox
                checked={formik.values.postUrlIsRelativePath}
                label="Is post url relative path?"
                onChange={(checked) => {
                  formik.setFieldValue('postUrlIsRelativePath', checked)
                }}
              />

              <Spacer height={contentPadding} />
              <View style={{ flexDirection: 'row' }}>
                <Button
                  style={{ width: 'auto', marginRight: contentPadding }}
                  onPress={() => {
                    dispatch(addCustomizedCrawlerTerminate({}))
                    dispatch(tryCustomizedCrawlerTerminate({}))
                    formik.setFieldValue('isTrying', true)
                    formik.submitForm()
                  }}
                  disabled={
                    tryCrawlerStatus ===
                    constants.TryCustomizedCrawlerStatus.Loading
                  }
                >
                  {tryCrawlerStatus ===
                  constants.TryCustomizedCrawlerStatus.Loading
                    ? 'Loading...'
                    : 'Try crawler'}
                </Button>
                <Button
                  style={{ width: 'auto' }}
                  onPress={() => {
                    dispatch(addCustomizedCrawlerTerminate({}))
                    dispatch(tryCustomizedCrawlerTerminate({}))
                    formik.setFieldValue('isTrying', false)
                    formik.submitForm()
                  }}
                  disabled={
                    tryCrawlerStatus ===
                    constants.TryCustomizedCrawlerStatus.Loading
                  }
                >
                  {addCustomizedSourceStatus ===
                  constants.AddSourceStatus.Loading
                    ? 'Loading...'
                    : 'Add ' + target}
                </Button>
              </View>

              <Spacer height={contentPadding} />
              <ThemedText color={theme.red} style={[sharedStyles.largeText]}>
                {getWarningMsg()}
              </ThemedText>
              <ThemedText
                color="foregroundColor"
                style={[sharedStyles.largeText]}
              >
                {displayTryResponse(tryCustomizedCrawlerPosts)}
              </ThemedText>
            </View>
          </Container>
        </ScrollView>
      </Screen>
    )
  },
)

export default AddSourceOrSubsourceScreen
