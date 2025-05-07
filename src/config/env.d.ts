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
    }
  }
}

export {};
