import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { VideojuegosModule } from './videojuegos/videojuegos.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Videojuego } from './videojuegos/entities/videojuego.entity.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'databridge_e01',
      entities: [Videojuego],
      synchronize: true,
      autoLoadEntities: true
    }),
    VideojuegosModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
