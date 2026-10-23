import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pelicula } from './entities/pelicula.entity.js';
import { Repository } from 'typeorm';
import { NotFoundError } from 'rxjs';

@Injectable()
export class PeliculasService implements OnModuleInit {

  constructor(@InjectRepository(Pelicula)
  private readonly repository: Repository<Pelicula>) { }

  async onModuleInit() {
    if (await this.repository.count() === 0) {
      await this.repository.save([
        this.repository.create({
          titulo: 'Gladiator',
          descripcion: 'Gladiator is a 2000 American epic historical drama film directed by Ridley Scott and written by David Franzoni, John Logan, and William Nicholson.',
          genero: 'Acción',
          anio: 2000,
          puntuacion: 8.5,
          imagenUrl: 'https://image.tmdb.org/t/p/w500/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg',
          favorita: false
        }),
        this.repository.create({
          titulo: 'The Matrix',
          descripcion: 'The Matrix is a 1999 science fiction action film directed by the Wachowskis.',
          genero: 'Ciencia ficción',
          anio: 1999,
          puntuacion: 8.7,
          imagenUrl: 'https://image.tmdb.org/t/p/w500/dXNAPwY7VrqMAo51EKhhCJfaGb5.jpg',
          favorita: false
        }),
        this.repository.create({
          titulo: 'The Lion King',
          descripcion: 'The Lion King is a 1994 American animated musical adventure film produced by Walt Disney Feature Animation and released by Walt Disney Pictures.',
          genero: 'Animación',
          anio: 1994,
          puntuacion: 8.9,
          imagenUrl: 'https://image.tmdb.org/t/p/w500/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg',
          favorita: false
        }),
        this.repository.create({
          titulo: 'El Padrino',
          descripcion: "The Godfather is a 1972 American crime film directed by Francis Ford Coppola, who co-wrote the screenplay with Mario Puzo, based on Puzo's best-selling 1969 novel of the same name.",
          genero: 'Crimen',
          anio: 1972,
          puntuacion: 9.2,
          imagenUrl: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
          favorita: false
        }),
        this.repository.create({
          titulo: 'El Padrino: Parte II',
          descripcion: 'The Godfather Part II is a 1974 American epic crime film produced and directed by Francis Ford Coppola. The film is partially based on the 1969 novel The Godfather by Mario Puzo.',
          genero: 'Crimen',
          anio: 1974,
          puntuacion: 9.0,
          imagenUrl: 'https://image.tmdb.org/t/p/w500/8a1lJs7mFyGhGhZZDT1azJUoQiZ.jpg',
          favorita: false
        })
      ]);
    }
  }

  findAll(): Promise<Pelicula[]> {
    return this.repository.find({
      order: {
        puntuacion: 'ASC'
      }
    });
  }

  async toggleFavourite(id: number): Promise<Pelicula> {
    const pelicula = await this.repository.findOneBy({
      id
    });
    if (!pelicula) throw new NotFoundException(`Pelicula con ID ${id} no encontrada`);
    pelicula.favorita = !pelicula.favorita;
    return this.repository.save(pelicula);
  }
}
