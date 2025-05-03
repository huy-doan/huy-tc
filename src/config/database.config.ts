import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from './orm.config';
import { DataSource } from 'typeorm';

export const databaseConfig = TypeOrmModule.forRootAsync({
    useFactory: () => (config),
    dataSourceFactory: async (options) => {
      const dataSource = await new DataSource(options).initialize();
      return dataSource;
    },
  });
