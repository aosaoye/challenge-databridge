import { Controller, Get, Query } from '@nestjs/common';
import { Evento } from './evento.entity';
import { EventosService } from './eventos.service';

@Controller('eventos')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  // GET /eventos?ciudad=Zaragoza&categoria=Tecnología
  @Get()
  findAll(
    @Query('ciudad') ciudad?: string,
    @Query('categoria') categoria?: string,
  ): Promise<Evento[]> {
    return this.eventosService.findAll(ciudad, categoria);
  }
}
