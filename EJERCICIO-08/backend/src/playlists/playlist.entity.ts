import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Cancion } from './cancion.entity';

@Entity('playlists')
export class Playlist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  descripcion: string;

  @OneToMany(() => Cancion, (cancion) => cancion.playlist, { cascade: true })
  canciones: Cancion[];
}
