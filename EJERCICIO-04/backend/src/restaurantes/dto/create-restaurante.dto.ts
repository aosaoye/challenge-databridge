import { IsString, MinLength, IsInt, Min, Max } from 'class-validator';

export class CreateRestauranteDto {
  @IsString()
  @MinLength(3)
  nombre: string;

  @IsString()
  @MinLength(3)
  tipo: string;

  @IsString()
  @MinLength(3)
  ciudad: string;

  @IsInt()
  @Min(1)
  @Max(10)
  puntuacion: number;
}
