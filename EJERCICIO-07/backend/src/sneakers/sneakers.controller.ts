import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateSneakerDto } from './create-sneaker.dto';
import { Sneaker } from './sneaker.entity';
import { SneakersService } from './sneakers.service';
import { UpdateSneakerDto } from './update-sneaker.dto';

@Controller('sneakers')
export class SneakersController {
  constructor(private readonly sneakersService: SneakersService) {}

  @Post()
  create(@Body() dto: CreateSneakerDto): Promise<Sneaker> {
    return this.sneakersService.create(dto);
  }

  @Get()
  findAll(): Promise<Sneaker[]> {
    return this.sneakersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Sneaker> {
    return this.sneakersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSneakerDto,
  ): Promise<Sneaker> {
    return this.sneakersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sneakersService.remove(id);
  }
}
