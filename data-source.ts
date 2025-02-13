import { DataSource } from 'typeorm';
// import * as path from 'path';
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'srok_sart',
  synchronize: process.env.DB_SYNC === 'true' || false,
});
