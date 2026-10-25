import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateViajeDto } from './update-viaje.dto';
import { Viaje } from './viaje.entity';

@Injectable()
export class ViajesService implements OnModuleInit {
  constructor(
    @InjectRepository(Viaje)
    private readonly repository: Repository<Viaje>,
  ) {}

  async onModuleInit() {
    const total = await this.repository.count();
    if (total === 0) {
      const iniciales: Viaje[] = [
        this.repository.create({
          destino: 'Tokio',
          pais: 'Japón',
          fecha: '2027-04-10',
          estado: 'RESERVADO',
        }),
        this.repository.create({
          destino: 'Roma',
          pais: 'Italia',
          fecha: '2027-06-15',
          estado: 'PLANIFICADO',
        }),
        this.repository.create({
          destino: 'Kioto',
          pais: 'Japón',
          fecha: '2027-04-18',
          estado: 'PLANIFICADO',
        }),
        this.repository.create({
          destino: 'Nueva York',
          pais: 'Estados Unidos',
          fecha: '2026-11-20',
          estado: 'COMPLETADO',
        }),
      ];
      await this.repository.save(iniciales);
    }
  }

  findAll(): Promise<Viaje[]> {
    return this.repository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Viaje> {
    const viaje = await this.repository.findOne({ where: { id } });
    if (!viaje) {
      throw new NotFoundException(`Viaje con ID ${id} no encontrado`);
    }
    return viaje;
  }

  async update(id: number, updateViajeDto: UpdateViajeDto): Promise<Viaje> {
    const viaje = await this.findOne(id);
    this.repository.merge(viaje, updateViajeDto);
    return this.repository.save(viaje);
  }
}
