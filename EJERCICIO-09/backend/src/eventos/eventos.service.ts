import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Evento } from './evento.entity';

@Injectable()
export class EventosService implements OnModuleInit {
  constructor(
    @InjectRepository(Evento)
    private readonly repository: Repository<Evento>,
  ) {}

  async onModuleInit() {
    const total = await this.repository.count();
    if (total === 0) {
      const iniciales: Evento[] = [
        this.repository.create({
          titulo: 'Tech Meetup React & AI',
          ciudad: 'Zaragoza',
          categoria: 'Tecnología',
          fecha: '2026-11-15',
          precio: 0,
        }),
        this.repository.create({
          titulo: 'Festival Gastronómico del Pilar',
          ciudad: 'Zaragoza',
          categoria: 'Gastronomía',
          fecha: '2026-12-05',
          precio: 15.0,
        }),
        this.repository.create({
          titulo: 'Concierto Jazz & Soul Night',
          ciudad: 'Zaragoza',
          categoria: 'Música',
          fecha: '2026-11-28',
          precio: 25.0,
        }),
        this.repository.create({
          titulo: 'Madrid Cloud & Dev Summit',
          ciudad: 'Madrid',
          categoria: 'Tecnología',
          fecha: '2026-12-10',
          precio: 45.0,
        }),
        this.repository.create({
          titulo: 'Exposición Arte Moderno',
          ciudad: 'Madrid',
          categoria: 'Arte',
          fecha: '2026-11-20',
          precio: 12.5,
        }),
        this.repository.create({
          titulo: 'Barcelona Indie Fest',
          ciudad: 'Barcelona',
          categoria: 'Música',
          fecha: '2027-01-14',
          precio: 35.0,
        }),
      ];
      await this.repository.save(iniciales);
    }
  }

  // RETO: Combina ciudad + categoria en una misma consulta
  findAll(ciudad?: string, categoria?: string): Promise<Evento[]> {
    const where: FindOptionsWhere<Evento> = {};

    if (ciudad && ciudad.trim() && ciudad !== 'Todas') {
      where.ciudad = ciudad.trim();
    }

    if (categoria && categoria.trim() && categoria !== 'Todas') {
      where.categoria = categoria.trim();
    }

    return this.repository.find({
      where,
      order: { id: 'ASC' },
    });
  }
}
