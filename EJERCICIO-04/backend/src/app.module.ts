import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { RestaurantesModule } from './restaurantes/restaurantes.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'root',
    database: 'databridge_e04',
    autoLoadEntities: true,
    synchronize: true,
  }), RestaurantesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
