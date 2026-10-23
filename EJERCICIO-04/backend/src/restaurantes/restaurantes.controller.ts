import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RestaurantesService } from './restaurantes.service.js';
import { CreateRestauranteDto } from './dto/create-restaurante.dto.js';

@Controller('restaurantes')
export class RestaurantesController {
  constructor(private readonly restaurantesService: RestaurantesService) {}

  @Post()
  create(@Body() createRestauranteDto: CreateRestauranteDto) {
    return this.restaurantesService.create(createRestauranteDto);
  }

  @Get()
  findAll() {
    return this.restaurantesService.findAll();
  }

}
