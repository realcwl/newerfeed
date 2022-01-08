// pb-text-format-to-json doesn't support react native, dependency 'os' is not available
// in react-native, since customize subsource page is not being used in iOS
// set parse as an empty function to make iOS buildable
const parse = () => {
  console.error('parse not supported in native platforms')
} // input: any, schema?: any
export { parse }
