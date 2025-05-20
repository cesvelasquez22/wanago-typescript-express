
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
  synchronize: true,

};

export const AppDataSource = new DataSource(dataSourceOptions);
 
export default AppDataSource;