import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'C03 - Ejercicio 10: Wander API';
  }
}
