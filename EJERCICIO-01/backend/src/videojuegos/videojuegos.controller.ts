import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VideojuegosService } from './videojuegos.service.js';
import { Videojuego } from './entities/videojuego.entity.js';

@Controller('videojuegos')
export class VideojuegosController {
  constructor(private readonly videojuegosService: VideojuegosService) {}

  @Get()
  findAll(): Promise<Videojuego[]> {
    return this.videojuegosService.findAll();
  }

}
