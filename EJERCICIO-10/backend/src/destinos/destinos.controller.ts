import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateDestinoDto } from './create-destino.dto';
import { Destino } from './destino.entity';
import { DestinosService } from './destinos.service';
import { UpdateDestinoDto } from './update-destino.dto';

@Controller('destinos')
export class DestinosController {
  constructor(private readonly destinosService: DestinosService) {}

  @Post()
  create(@Body() dto: CreateDestinoDto): Promise<Destino> {
    return this.destinosService.create(dto);
  }

  @Get()
  findAll(): Promise<Destino[]> {
    return this.destinosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Destino> {
    return this.destinosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDestinoDto,
  ): Promise<Destino> {
    return this.destinosService.update(id, dto);
  }

  // RETO: Mejora propia coherente (Toggle visitado)
  @Patch(':id/toggle-visitado')
  toggleVisitado(@Param('id', ParseIntPipe) id: number): Promise<Destino> {
    return this.destinosService.toggleVisitado(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.destinosService.remove(id);
  }
}
