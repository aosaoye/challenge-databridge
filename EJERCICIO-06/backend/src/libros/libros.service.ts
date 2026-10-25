import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Libro } from './libro.entity';

@Injectable()
export class LibrosService implements OnModuleInit {
  constructor(
    @InjectRepository(Libro)
    private readonly repository: Repository<Libro>,
  ) {}

  async onModuleInit() {
    const total = await this.repository.count();
    if (total === 0) {
      const iniciales: Libro[] = [
        this.repository.create({
          titulo: '1984',
          autor: 'George Orwell',
          paginas: 328,
          leido: false,
        }),
        this.repository.create({
          titulo: 'Un mundo feliz',
          autor: 'Aldous Huxley',
          paginas: 288,
          leido: true,
        }),
        this.repository.create({
          titulo: 'Fahrenheit 451',
          autor: 'Ray Bradbury',
          paginas: 256,
          leido: false,
        }),
        this.repository.create({
          titulo: 'El señor de los anillos',
          autor: 'J.R.R. Tolkien',
          paginas: 1200,
          leido: false,
        }),
      ];
      await this.repository.save(iniciales);
    }
  }

  findAll(): Promise<Libro[]> {
    return this.repository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Libro> {
    const libro = await this.repository.findOne({ where: { id } });
    if (!libro) {
      throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    }
    return libro;
  }

  // RETO: Marcar como leído utilizando PATCH
  async toggleLeido(id: number): Promise<Libro> {
    const libro = await this.findOne(id);
    libro.leido = !libro.leido;
    return this.repository.save(libro);
  }

  // DELETE
  async remove(id: number): Promise<{ mensaje: string; id: number }> {
    const libro = await this.findOne(id);
    await this.repository.remove(libro);
    return { mensaje: 'Libro eliminado exitosamente', id };
  }
}
