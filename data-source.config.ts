import * as path from 'path';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

// Load environment variables
config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'srok_sart',
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*-migration.ts'],
  migrationsRun: false,
  synchronize: false,
  logging: true,
  // ssl: {
  //   rejectUnauthorized: false,
  // },
});

export default AppDataSource;
