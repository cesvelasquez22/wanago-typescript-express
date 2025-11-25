import { DataSource, DataSourceOptions } from 'typeorm';

import config from "./config";
const { NODE_ENV, POSTGRES_PORT, POSTGRES_HOST, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } = config;
 
const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: POSTGRES_HOST,
  port: Number(POSTGRES_PORT),
  username: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
  logging: NODE_ENV == 'development' ? false : true,
  entities: [
    __dirname + '/../**/*.entity{.ts,.js}',
  ],
  migrations: [
    __dirname + '/../migrations/**/*{.ts,.js}',
    __dirname + '/../src/migrations/**/*{.ts,.js}'
  ],
  synchronize: NODE_ENV == 'development' ? true : false,
  ssl: NODE_ENV == 'production' || NODE_ENV == 'staging' ? { rejectUnauthorized: false } : false,
};

export const AppDataSource = new DataSource(dataSourceOptions);