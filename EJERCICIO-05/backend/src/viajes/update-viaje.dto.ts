import { IsOptional, IsString } from 'class-validator';

export class UpdateViajeDto {
  @IsOptional()
  @IsString()
  destino?: string;

  @IsOptional()
  @IsString()
  pais?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  fecha?: string; // Reto
}
