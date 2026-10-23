import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { MascotasModule } from './mascotas/mascotas.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forRoot({
    type:'postgres',
    host:'localhost',
    port:5432,
    username:'postgres',
    password:'root',
    database:'databridge_e03',
    autoLoadEntities: true,
    synchronize: true
  }),MascotasModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
