// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const environmentConfig = (): Record<string, any> => ({
  server: {
    port: Number(process.env.PORT),
    baseUrl: process.env.BASE_APP_URL,
  },
  cognito: {
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    clientId: process.env.COGNITO_CLIENT_ID,
    issuer: process.env.COGNITO_ISSUER,
    endpoint: process.env.COGNITO_ENDPOINT,
  },
  frontend: {
    url: process.env.FRONTEND_URL,
  },
});
