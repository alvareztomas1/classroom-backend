import * as dotenv from 'dotenv';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

import { ENVIRONMENT } from '@config/environment.enum';

dotenv.config();

const production: DataSourceOptions = {
  type: process.env.DB_TYPE as PostgresConnectionOptions['type'],
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),
};

const staging: DataSourceOptions = {
  type: process.env.DB_TYPE as PostgresConnectionOptions['type'],
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),
};

const development: DataSourceOptions = {
  type: process.env.DB_TYPE as PostgresConnectionOptions['type'],
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  namingStrategy: new SnakeNamingStrategy(),
};

const automatedTests: DataSourceOptions = {
  type: 'better-sqlite3',
  database: `./data/sqlite/test.${Math.random()}.db`,
  synchronize: true,
  dropSchema: false,
  entities: ['./src/**/infrastructure/database/**/*.schema.ts'],
  namingStrategy: new SnakeNamingStrategy(),
};

export const datasourceOptions: DataSourceOptions = ((): DataSourceOptions => {
  if (process.env.NODE_ENV === ENVIRONMENT.PRODUCTION) {
    return production;
  }

  if (process.env.NODE_ENV === ENVIRONMENT.STAGING) {
    return staging;
  }

  if (process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT) {
    return development;
  }

  if (process.env.NODE_ENV === ENVIRONMENT.AUTOMATED_TESTS) {
    return automatedTests;
  }

  throw new Error(
    'Please choose "production", "staging", "development" or "automated_tests" as your environment',
  );
})();

export default new DataSource({
  ...datasourceOptions,
  entities: [join(__dirname, '../**/infrastructure/database/**/*.schema.ts')],
  migrations: [join(__dirname, '../../data/migrations/*.ts')],
});
