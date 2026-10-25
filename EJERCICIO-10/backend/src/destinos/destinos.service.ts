import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDestinoDto } from './create-destino.dto';
import { Destino } from './destino.entity';
import { UpdateDestinoDto } from './update-destino.dto';

@Injectable()
export class DestinosService implements OnModuleInit {
  constructor(
    @InjectRepository(Destino)
    private readonly repository: Repository<Destino>,
  ) {}

  async onModuleInit() {
    const total = await this.repository.count();
    if (total === 0) {
      const iniciales: Destino[] = [
        this.repository.create({
          nombre: 'Reikiavik',
          pais: 'Islandia',
          continente: 'Europa',
          prioridad: 'ALTA',
          presupuesto: 1400,
          visitado: false,
        }),
        this.repository.create({
          nombre: 'Kioto',
          pais: 'Japón',
          continente: 'Asia',
          prioridad: 'ALTA',
          presupuesto: 1800,
          visitado: true,
        }),
        this.repository.create({
          nombre: 'Banff',
          pais: 'Canadá',
          continente: 'América',
          prioridad: 'MEDIA',
          presupuesto: 1200,
          visitado: false,
        }),
        this.repository.create({
          nombre: 'Queenstown',
          pais: 'Nueva Zelanda',
          continente: 'Oceanía',
          prioridad: 'MEDIA',
          presupuesto: 2100,
          visitado: false,
        }),
      ];
      await this.repository.save(iniciales);
    }
  }

  create(dto: CreateDestinoDto): Promise<Destino> {
    const destino = this.repository.create(dto);
    return this.repository.save(destino);
  }

  findAll(): Promise<Destino[]> {
    return this.repository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Destino> {
    const destino = await this.repository.findOne({ where: { id } });
    if (!destino) {
      throw new NotFoundException(`Destino con ID ${id} no encontrado`);
    }
    return destino;
  }

  async update(id: number, dto: UpdateDestinoDto): Promise<Destino> {
    const destino = await this.findOne(id);
    this.repository.merge(destino, dto);
    return this.repository.save(destino);
  }

  // RETO: Mejora propia coherente (Toggle visitado)
  async toggleVisitado(id: number): Promise<Destino> {
    const destino = await this.findOne(id);
    destino.visitado = !destino.visitado;
    return this.repository.save(destino);
  }

  async remove(id: number): Promise<{ mensaje: string; id: number }> {
    const destino = await this.findOne(id);
    await this.repository.remove(destino);
    return { mensaje: 'Destino eliminado', id };
  }
}
