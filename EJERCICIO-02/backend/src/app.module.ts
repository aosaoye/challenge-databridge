import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeliculasModule } from './peliculas/peliculas.module.js';
import { Pelicula } from './peliculas/entities/pelicula.entity.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'databridge_e02',
      entities: [Pelicula],
      synchronize: true,
      autoLoadEntities: true
    }),
    PeliculasModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
