import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CreateCancionDto } from './create-cancion.dto';
import { Playlist } from './playlist.entity';
import { PlaylistsService } from './playlists.service';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Get()
  findAll(): Promise<Playlist[]> {
    return this.playlistsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Playlist> {
    return this.playlistsService.findOne(id);
  }

  // RETO: Añadir canción a una playlist
  @Post(':id/canciones')
  addCancion(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCancionDto,
  ) {
    return this.playlistsService.addCancion(id, dto);
  }
}
