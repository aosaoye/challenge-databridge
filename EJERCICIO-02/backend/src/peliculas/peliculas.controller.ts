import { Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { PeliculasService } from './peliculas.service.js';

@Controller('peliculas')
export class PeliculasController {
  constructor(private readonly peliculasService: PeliculasService) {}

  @Get()
  findAll() {
    return this.peliculasService.findAll();
  }

  @Patch(':id/toggle-favorita')
  toggleFavourite(@Param('id', ParseIntPipe) id: number) {
    console.log(`Hola, tienes algo ${id}`)
    return this.peliculasService.toggleFavourite(+id);
  }
}
