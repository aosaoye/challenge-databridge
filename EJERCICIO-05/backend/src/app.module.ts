import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ViajesModule } from './viajes/viajes.module';
import { Viaje } from './viajes/viaje.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'databridge_e05',
      entities: [Viaje],
      autoLoadEntities: true,
      synchronize: true,
    }),
    ViajesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
