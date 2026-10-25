import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('viajes')
export class Viaje {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  destino: string;

  @Column()
  pais: string;

  @Column({ default: '2027-04-10' })
  fecha: string; // Reto

  @Column({ default: 'PLANIFICADO' })
  estado: string;
}
