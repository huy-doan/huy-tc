import { DataSource } from 'typeorm';
import { config } from './orm.config';

const dataSource = new DataSource(config);
export default dataSource;
