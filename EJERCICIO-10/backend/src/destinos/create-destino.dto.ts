import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateDestinoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  pais: string;

  @IsString()
  @IsOptional()
  continente?: string;

  @IsString()
  @IsOptional()
  prioridad?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  presupuesto?: number;

  @IsBoolean()
  @IsOptional()
  visitado?: boolean;
}
