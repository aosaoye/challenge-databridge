import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'C03 - Ejercicio 09: Event Radar API';
  }
}
