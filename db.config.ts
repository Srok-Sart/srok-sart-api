import { registerAs } from '@nestjs/config';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import * as path from 'path';

export default registerAs(
  'database',
  (): PostgresConnectionOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'srok_sart',
    entities: [path.join(__dirname, '/**/*.entity{.ts,.js}')],
    synchronize: process.env.DB_SYNC === 'true' || false,
    ssl: {
      rejectUnauthorized: false, // Allows self-signed certificates
    },
  }),
);
