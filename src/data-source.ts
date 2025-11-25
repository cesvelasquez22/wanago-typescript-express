import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';

import config from "./config";
const { NODE_ENV, POSTGRES_PORT, POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } = config;

const isProd = NODE_ENV === 'production';

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: POSTGRES_HOST,
  port: Number(POSTGRES_PORT),
  username: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
  logging: NODE_ENV == 'development' ? false : true,
  entities: isProd
    ? [path.join(__dirname, '../**/*.entity.js')]   // when running compiled JS (dist -> use .js)
    : [path.join(__dirname, '**/*.entity.ts')],     // when running ts-node / dev
  migrations: isProd
    ? [path.join(__dirname, '../migration/*.js')]
    : [path.join(__dirname, '../migration/*.ts')],
  synchronize: NODE_ENV == 'development' ? true : false,
  ssl: isProd ? { rejectUnauthorized: false } : false,
};

export const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;