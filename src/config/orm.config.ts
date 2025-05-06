import { env } from './env.config';
import { DataSourceOptions } from 'typeorm';

let isTest = process.env.NODE_ENV === 'test';
export const config: DataSourceOptions = {
    type: env.DATABASE.CONNECT,
    host: env.DATABASE.HOST,
    port: env.DATABASE.PORT,
    username: env.DATABASE.USER,
    password: env.DATABASE.PASSWORD,
    database: env.DATABASE.NAME + (isTest ? '_unit_test' : ''),
    entities: [`${env.ROOT_PATH}/**/*.entity.${isTest ? 'ts' : 'js'}`],
    factories: [`${env.ROOT_PATH}/**/databases/factories/*.factory.${isTest ? 'ts' : 'js'}`],
    synchronize: false,
    migrations: [
        `${env.ROOT_PATH}/**/databases/migrations/*.${isTest ? 'ts' : 'js'}`
    ],
    migrationsRun: true,
    keepConnectionAlive: true,
    autoLoadEntities: true,
    dropSchema: isTest, // WARNING: must be careful at this option
    cli: {
        migrationsDir: `${env.ROOT_PATH}/**/databases/migrations/*.${isTest ? 'ts' : 'js'}`
    },
    logging: false
} as any;
