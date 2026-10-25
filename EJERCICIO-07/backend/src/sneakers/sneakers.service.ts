import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSneakerDto } from './create-sneaker.dto';
import { Sneaker } from './sneaker.entity';
import { UpdateSneakerDto } from './update-sneaker.dto';

@Injectable()
export class SneakersService implements OnModuleInit {
  constructor(
    @InjectRepository(Sneaker)
    private readonly repository: Repository<Sneaker>,
  ) {}

  async onModuleInit() {
    const total = await this.repository.count();
    if (total === 0) {
      const iniciales: Sneaker[] = [
        this.repository.create({
          modelo: 'Air Max 1',
          marca: 'Nike',
          precio: 149.99,
          stock: 4,
        }),
        this.repository.create({
          modelo: 'Forum Low',
          marca: 'Adidas',
          precio: 109.99,
          stock: 0, // Agotado
        }),
        this.repository.create({
          modelo: 'New Balance 550',
          marca: 'New Balance',
          precio: 129.99,
          stock: 6,
        }),
        this.repository.create({
          modelo: 'Dunk Low Retro',
          marca: 'Nike',
          precio: 119.99,
          stock: 2,
        }),
      ];
      await this.repository.save(iniciales);
    }
  }

  create(dto: CreateSneakerDto): Promise<Sneaker> {
    const nuevo = this.repository.create(dto);
    return this.repository.save(nuevo);
  }

  findAll(): Promise<Sneaker[]> {
    return this.repository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Sneaker> {
    const sneaker = await this.repository.findOne({ where: { id } });
    if (!sneaker) {
      throw new NotFoundException(`Sneaker con ID ${id} no encontrada`);
    }
    return sneaker;
  }

  async update(id: number, dto: UpdateSneakerDto): Promise<Sneaker> {
    const sneaker = await this.findOne(id);
    this.repository.merge(sneaker, dto);
    return this.repository.save(sneaker);
  }

  async remove(id: number): Promise<{ mensaje: string; id: number }> {
    const sneaker = await this.findOne(id);
    await this.repository.remove(sneaker);
    return { mensaje: 'Sneaker eliminada', id };
  }
}
