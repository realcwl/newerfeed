import { CognitoUserPool } from 'amazon-cognito-identity-js'

// This contains user pool for project "test" on Cognito.
const UserPool = {
  UserPoolId: 'us-west-1_eMfEIxhTo',
  ClientId: 'df24fo42pjmjtj6racppf4b20',
}

export default new CognitoUserPool(UserPool)
