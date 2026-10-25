import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'C03 - Ejercicio 07: Sneaker Vault API';
  }
}
