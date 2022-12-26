export default {
  meEndpoint: '/auth/me',
  loginEndpoint: '/jwt/login',
  registerEndpoint: '/jwt/register',
  storageTokenKeyName: 'accessToken',
  onTokenExpiration: 'refreshToken', // logout | refreshToken
  me: '/auth/me',
  login: '/auth/login',
  register: '/auth/register',
  refreshToken: '/auth/refreshToken' // logout | refreshToken
}
