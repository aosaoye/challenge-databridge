import { Module } from '@nestjs/common';
import { RestaurantesService } from './restaurantes.service.js';
import { RestaurantesController } from './restaurantes.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurante } from './entities/restaurante.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurante])],
  controllers: [RestaurantesController],
  providers: [RestaurantesService],
})
export class RestaurantesModule {}
