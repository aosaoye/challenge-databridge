import { Controller, Delete, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { Libro } from './libro.entity';
import { LibrosService } from './libros.service';

@Controller('libros')
export class LibrosController {
  constructor(private readonly librosService: LibrosService) {}

  @Get()
  findAll(): Promise<Libro[]> {
    return this.librosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Libro> {
    return this.librosService.findOne(id);
  }

  // RETO: Marcar como leído utilizando PATCH
  @Patch(':id/leido')
  toggleLeido(@Param('id', ParseIntPipe) id: number): Promise<Libro> {
    return this.librosService.toggleLeido(id);
  }

  // DELETE
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.librosService.remove(id);
  }
}
