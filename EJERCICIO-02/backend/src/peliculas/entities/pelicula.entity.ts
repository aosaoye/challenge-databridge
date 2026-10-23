import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Pelicula {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({type:"varchar", length: 100, nullable: false})
    titulo: string;

    @Column({type:"varchar", length: 1000, nullable: false})
    descripcion: string;

    @Column({type:"varchar", length: 100, nullable: false})
    genero: string;

    @Column({type:"int", nullable: false})
    anio: number;

    @Column('decimal', {
        precision: 3,
        scale: 1
    })
    puntuacion: number;

    @Column({type:"varchar", length: 200, nullable: false})
    imagenUrl: string;

    @Column({type: "boolean", default: false})
    favorita: boolean;
}
