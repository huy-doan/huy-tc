import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from '~config/database.config';
import { UserModule } from './user/user.module';
import { BinanceModule } from './binances/binance.module';

@Module({
  imports: [
    databaseConfig,
    UserModule,
    BinanceModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
