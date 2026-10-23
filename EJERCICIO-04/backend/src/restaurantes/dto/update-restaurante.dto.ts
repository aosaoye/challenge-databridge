import { PartialType } from '@nestjs/mapped-types';
import { CreateRestauranteDto } from './create-restaurante.dto.js';

export class UpdateRestauranteDto extends PartialType(CreateRestauranteDto) {}
