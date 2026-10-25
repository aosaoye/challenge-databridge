import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateCancionDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  artista: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  duracionSegundos?: number;
}
