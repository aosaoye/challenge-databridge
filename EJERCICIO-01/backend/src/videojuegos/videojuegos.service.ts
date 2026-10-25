import { OnModuleInit, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Videojuego } from './entities/videojuego.entity.js';
import { Repository } from 'typeorm';

@Injectable()
export class VideojuegosService implements OnModuleInit {

  constructor(@InjectRepository(Videojuego)
private readonly repository: Repository<Videojuego>){}

  async onModuleInit(): Promise<void>{
    const total = await this.repository.count()

    if(total === 0) {
      const iniciales: Videojuego[] = [
        this.repository.create({
          titulo:'The Witcher 3: Wild Hunt',
          plataforma:'PS5',
          genero: 'Rol / RPG',
          descripcion:'The Witcher 3: Wild Hunt es un videojuego de rol de acción de mundo abierto',
          puntuacion:9.2,
          imagenUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/library_600x900.jpg"
        }),
        this.repository.create({
          titulo:'The Legend of Zelda: Breath of the Wild',
          plataforma:'Nintendo Switch',
          genero: 'Aventura',
          descripcion:'The Legend of Zelda: Breath of the Wild es un videojuego de acción y aventura de mundo abierto',
          puntuacion:9.7,
          imagenUrl: "https://images.igdb.com/igdb/image/upload/t_cover_big/co3p2d.jpg"
        }),
        this.repository.create({
          titulo:'Grand Theft Auto V',
          plataforma:'PS5',
          genero: 'Acción / Mundo abierto',
          descripcion:'Grand Theft Auto V es un videojuego de acción y aventura de mundo abierto',
          puntuacion:9.5,
          imagenUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/library_600x900.jpg"
        }),
        this.repository.create({
          titulo:'Red Dead Redemption 2',
          plataforma:'PS5',
          genero: 'Acción / Aventura',
          descripcion:'Red Dead Redemption 2 es un videojuego de acción y aventura de mundo abierto',
          puntuacion:9.6,
          imagenUrl:"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1174180/library_600x900.jpg"
        }),
        this.repository.create({
          titulo:'The Last of Us Part I',
          plataforma:'PS5',
          genero: 'Supervivencia / Acción',
          descripcion:'The Last of Us Part I es un videojuego de acción y aventura de mundo abierto',
          puntuacion:9.4,
          imagenUrl:"https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1888930/library_600x900.jpg"
        }),
        this.repository.create({
          titulo:"Hades",
          plataforma:"Nintendo Switch",
          genero: 'Roguelike / Acción',
          descripcion:"Un dungeon crawler rogue-like en el que desafiarás al dios de los muertos mientras te abres camino a golpes para escapar del Inframundo.",
          puntuacion:9.3,
          imagenUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145360/library_600x900.jpg"
        })
      ]

      await this.repository.save(iniciales)
    } else {
      // Migrar registros existentes que tengan enlaces de Wikimedia (bloqueados con 403 Forbidden en React Native)
      const games = await this.repository.find();
      for (const game of games) {
        if (game.imagenUrl?.includes('wikimedia.org') || game.imagenUrl?.includes('wikipedia.org')) {
          if (game.titulo.toLowerCase().includes('witcher')) {
            game.imagenUrl = 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/292030/library_600x900.jpg';
            await this.repository.save(game);
          } else if (game.titulo.toLowerCase().includes('zelda')) {
            game.imagenUrl = 'https://images.igdb.com/igdb/image/upload/t_cover_big/co3p2d.jpg';
            await this.repository.save(game);
          }
        }
      }
    }
  }

  findAll():  Promise<Videojuego[]> {
    return this.repository.find({
      order: {
        puntuacion: 'DESC'
      }
    })
  }
}
