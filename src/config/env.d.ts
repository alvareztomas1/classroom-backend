import { ENVIRONMENT } from '@config/environment.enum';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: ENVIRONMENT;
      DB_HOST: string;
      DB_PORT: string;
      DB_USERNAME: string;
      DB_PASSWORD: string;
      DB_TYPE: string;
      DB_NAME: string;
      PORT: string;
      BASE_APP_URL: string;
      FRONTEND_URL: string;
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_REGION: string;
      AWS_ENDPOINT: string;
      COGNITO_USER_POOL_ID: string;
      COGNITO_CLIENT_ID: string;
      COGNITO_ENDPOINT: string;
      COGNITO_ISSUER: string;
      S3_BUCKET: string;
      PAYPAL_CLIENT_ID: string;
      PAYPAL_CLIENT_SECRET: string;
      PAYPAL_WEBHOOK_ID: string;
    }
  }
}

export {};
