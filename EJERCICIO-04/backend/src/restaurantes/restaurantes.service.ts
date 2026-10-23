import { Injectable } from '@nestjs/common';
import { CreateRestauranteDto } from './dto/create-restaurante.dto.js';
import { UpdateRestauranteDto } from './dto/update-restaurante.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurante } from './entities/restaurante.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class RestaurantesService {

  constructor(
    @InjectRepository(Restaurante)
    private readonly repository:Repository<Restaurante>
  ){}

  create(createRestauranteDto: CreateRestauranteDto) {
    const newRestaurante = this.repository.create(createRestauranteDto);
    return this.repository.save(newRestaurante);
  }

  findAll() {
    return this.repository.find({
      order: {
        puntuacion: 'ASC'
      }
    });
  }
}
