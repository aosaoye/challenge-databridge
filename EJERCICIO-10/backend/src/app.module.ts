import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DestinosModule } from './destinos/destinos.module';
import { Destino } from './destinos/destino.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'databridge_e10',
      entities: [Destino],
      autoLoadEntities: true,
      synchronize: true,
    }),
    DestinosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
