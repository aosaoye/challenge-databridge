import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('destinos')
export class Destino {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column()
  pais: string;

  @Column({ default: 'Europa' })
  continente: string;

  @Column({ default: 'ALTA' })
  prioridad: string; // 'ALTA' | 'MEDIA' | 'BAJA'

  @Column('decimal', { precision: 8, scale: 2, default: 800 })
  presupuesto: number;

  @Column({ default: false })
  visitado: boolean; // Reto: mejora propia coherente
}
