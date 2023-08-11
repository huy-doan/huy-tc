import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from './orm.config';
import { DataSource } from 'typeorm';

export const databaseConfig = TypeOrmModule.forRootAsync({
    // Use useFactory, useClass, or useExisting
    // to configure the DataSourceOptions.
    useFactory: () => (config),
    // dataSource receives the configured DataSourceOptions
    // and returns a Promise<DataSource>.
    dataSourceFactory: async (options) => {
      const dataSource = await new DataSource(options).initialize();
      return dataSource;
    },
  });
