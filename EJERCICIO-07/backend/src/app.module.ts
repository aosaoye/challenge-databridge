import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SneakersModule } from './sneakers/sneakers.module';
import { Sneaker } from './sneakers/sneaker.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'databridge_e07',
      entities: [Sneaker],
      autoLoadEntities: true,
      synchronize: true,
    }),
    SneakersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
