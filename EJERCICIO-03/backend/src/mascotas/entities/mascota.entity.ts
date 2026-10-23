import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity({ name: 'mascotas' })
export class Mascota {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'nombre', nullable: false, length: 50 })
    nombre: string;

    @Column({ name: 'raza', nullable: false, length: 50 })
    raza: string;

    @Column({ name: 'edad', nullable: false })
    edad: number;

    @Column({ name: 'ciudad', nullable: false, length: 50})
    ciudad: string;
}
