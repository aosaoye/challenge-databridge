import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sneakers')
export class Sneaker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  modelo: string;

  @Column()
  marca: string;

  @Column('decimal', { precision: 7, scale: 2 })
  precio: number;

  @Column({ type: 'int', default: 4 })
  stock: number; // Reto
}
