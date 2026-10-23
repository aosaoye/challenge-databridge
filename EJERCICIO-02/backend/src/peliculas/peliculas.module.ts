import { Module } from '@nestjs/common';
import { PeliculasService } from './peliculas.service.js';
import { PeliculasController } from './peliculas.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pelicula } from './entities/pelicula.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Pelicula])],
  controllers: [PeliculasController],
  providers: [PeliculasService],
})
export class PeliculasModule {}
