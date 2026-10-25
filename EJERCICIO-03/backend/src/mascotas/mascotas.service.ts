import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateMascotaDto } from './dto/create-mascota.dto.js';
import { UpdateMascotaDto } from './dto/update-mascota.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Mascota } from './entities/mascota.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class MascotasService implements OnModuleInit {

  constructor(@InjectRepository(Mascota)
private readonly repository: Repository<Mascota>){}

  async onModuleInit() {
    const total = await this.repository.count()
    if( total === 0 ){
      const mascotas: Mascota[] = [
        this.repository.create({
          nombre:'Firulais',
          raza:'Golden Retriever',
          edad:3,
          ciudad:'Ciudad de Guatemala',
          nivelEnergia: 'ALTO'
        }),
        this.repository.create({
          nombre:'Milo',
          raza:'Golden Retriever',
          edad:3,
          ciudad:'Ciudad de Guatemala',
          nivelEnergia: 'MEDIO'
        }),
        this.repository.create({
          nombre:'Lucy',
          raza:'Criollo',
          edad:2,
          ciudad:'Antigua Guatemala',
          nivelEnergia: 'ALTO'
        }),
        this.repository.create({
          nombre:'Coco',
          raza:'Poodle',
          edad:4,
          ciudad:'Quetzaltenango',
          nivelEnergia: 'BAJO'
        }),
        this.repository.create({
          nombre:'Rocky',
          raza:'Bulldog',
          edad:6,
          ciudad:'Quetzaltenango',
        }),
        this.repository.create({
          nombre:'Bambi',
          raza:'Bulldog',
          edad:5,
          ciudad:'Quetzaltenango',
        }),
        this.repository.create({
          nombre:'Lucky',
          raza:'Bulldog',
          edad:5,
          ciudad:'Quetzaltenango',
        }),
        this.repository.create({
          nombre:'Pelusa',
          raza:'Bulldog',
          edad:5,
          ciudad:'Quetzaltenango',
        }),
        this.repository.create({
          nombre:'Kiwi',
          raza:'Bulldog',
          edad:5,
          ciudad:'Quetzaltenango',
        }),
      ]

      await this.repository.save(mascotas)
    }
  }

  findAll(): Promise<Mascota[]> {
    return this.repository.find({
      order:{
        id: 'ASC'
      }
    });
  }

  async findOne(id: number): Promise<Mascota> {
    const mascota = await this.repository.findOne({
      where: {
        id
      }
    })
    if(!mascota){
      throw new NotFoundException(`Mascota con id ${id} no encontrada`);
    }
    return mascota;
  }
}
