import { PartialType } from '@nestjs/mapped-types';
import { CreateVideojuegoDto } from './create-videojuego.dto.js';

export class UpdateVideojuegoDto extends PartialType(CreateVideojuegoDto) {}
