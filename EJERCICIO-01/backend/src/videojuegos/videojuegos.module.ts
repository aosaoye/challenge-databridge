import { Module } from '@nestjs/common';
import { VideojuegosService } from './videojuegos.service.js';
import { VideojuegosController } from './videojuegos.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Videojuego } from './entities/videojuego.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Videojuego])
  ],
  controllers: [VideojuegosController],
  providers: [VideojuegosService],
})
export class VideojuegosModule {}
