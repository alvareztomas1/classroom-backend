// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const environmentConfig = (): Record<string, any> => ({
  server: {
    port: Number(process.env.PORT),
    baseUrl: process.env.BASE_APP_URL,
  },
  frontend: {
    url: process.env.FRONTEND_URL,
  },
});
