const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const appDirectory = fs.realpathSync(process.cwd())
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath)
const dotenv = require('dotenv')

const appIncludes = [
  resolveApp('src'),
  resolveApp('../core'),
  resolveApp('../components'),
  resolveApp('../../node_modules/react-native-gesture-handler'),
  resolveApp('../../node_modules/react-native-haptic-feedback'),
  resolveApp('../../node_modules/react-native-vector-icons'),
]

module.exports = function override(config, env) {
  const __DEV__ = env !== 'production'

  // allow importing from outside of src folder
  config.resolve.plugins = config.resolve.plugins.filter(
    (plugin) => plugin.constructor.name !== 'ModuleScopePlugin',
  )

  config.module.rules[0].include = appIncludes
  config.module.rules[1].oneOf[2].include = appIncludes
  config.module.rules[1].oneOf[2].options.plugins.push(
    require.resolve('babel-plugin-react-native-web'),
  )

  const envs = dotenv.config({ path: '../../.env' }).parsed
  let formatted = {}
  for (const [key, value] of Object.entries(envs)) {
    formatted[key] = JSON.stringify(value)
  }

  // use webpack to public dotenv variables to frontend
  config.plugins.push(
    new webpack.DefinePlugin({ __DEV__, 'process.env': formatted }),
  )

  config.plugins.push(
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportFilename: 'report.html',
    }),
  )

  config.plugins = config.plugins.filter(
    (plugin) => plugin?.constructor?.name !== 'ESLintWebpackPlugin',
  )

  return config
}
