import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("videojuegos")
export class Videojuego {

    @PrimaryGeneratedColumn()
    id:number

    @Column({type: "varchar", length: 100})
    titulo:string

    @Column({type: "varchar", length: 100})
    plataforma:string


    @Column({type: "varchar", length: 200})
    descripcion:string

    @Column({type: "decimal", 
        precision: 3,
        scale:1
    })
    puntuacion:number

    @Column({type: "varchar", length: 100, nullable: true})
    genero: string;

    @Column({type: "varchar", length: 200, nullable: true})
    imagenUrl?: string;
}
