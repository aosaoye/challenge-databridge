import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('eventos')
export class Evento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titulo: string;

  @Column()
  ciudad: string;

  @Column()
  categoria: string;

  @Column()
  fecha: string;

  @Column('decimal', { precision: 6, scale: 2, default: 0 })
  precio: number;
}
