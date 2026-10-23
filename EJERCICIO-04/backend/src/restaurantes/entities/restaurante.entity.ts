import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('restaurantes')
export class Restaurante {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type:'varchar',
        length:50,
        nullable: false
    })
    nombre: string;

    @Column({
        type:'varchar',
        length:100,
        nullable: false
    })
    tipo: string;

    @Column({
        type:'varchar',
        length:15,
        nullable: false
    })
    ciudad: string;

    @Column({
        type:'decimal',
        precision: 3,
        scale: 1
    })
    puntuacion: number;
}
