import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cancion } from './cancion.entity';
import { CreateCancionDto } from './create-cancion.dto';
import { Playlist } from './playlist.entity';

@Injectable()
export class PlaylistsService implements OnModuleInit {
  constructor(
    @InjectRepository(Playlist)
    private readonly playlistRepo: Repository<Playlist>,
    @InjectRepository(Cancion)
    private readonly cancionRepo: Repository<Cancion>,
  ) {}

  async onModuleInit() {
    const total = await this.playlistRepo.count();
    if (total === 0) {
      const p1 = this.playlistRepo.create({
        nombre: 'Entrenamiento',
        descripcion: 'Motivación y alta energía para entrenar',
      });
      await this.playlistRepo.save(p1);

      const cancionesP1 = [
        this.cancionRepo.create({
          titulo: 'Run Boy Run',
          artista: 'Woodkid',
          duracionSegundos: 213,
          playlist: p1,
        }),
        this.cancionRepo.create({
          titulo: 'Midnight City',
          artista: 'M83',
          duracionSegundos: 244,
          playlist: p1,
        }),
        this.cancionRepo.create({
          titulo: 'Can’t Hold Us',
          artista: 'Macklemore & Ryan Lewis',
          duracionSegundos: 258,
          playlist: p1,
        }),
      ];
      await this.cancionRepo.save(cancionesP1);

      const p2 = this.playlistRepo.create({
        nombre: 'Chill & Lo-Fi',
        descripcion: 'Para concentrarse y programar',
      });
      await this.playlistRepo.save(p2);

      const cancionesP2 = [
        this.cancionRepo.create({
          titulo: 'Coffee Breath',
          artista: 'Lo-Fi Beats',
          duracionSegundos: 160,
          playlist: p2,
        }),
      ];
      await this.cancionRepo.save(cancionesP2);
    }
  }

  findAll(): Promise<Playlist[]> {
    return this.playlistRepo.find({
      relations: ['canciones'],
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Playlist> {
    const playlist = await this.playlistRepo.findOne({
      where: { id },
      relations: ['canciones'],
    });
    if (!playlist) {
      throw new NotFoundException(`Playlist con ID ${id} no encontrada`);
    }
    return playlist;
  }

  // RETO: Añadir una canción a una playlist concreta
  async addCancion(playlistId: number, dto: CreateCancionDto): Promise<Cancion> {
    const playlist = await this.findOne(playlistId);
    const cancion = this.cancionRepo.create({
      ...dto,
      duracionSegundos: dto.duracionSegundos || 210,
      playlist,
    });
    return this.cancionRepo.save(cancion);
  }
}
