export interface Videojuego {
  id: number;
  titulo: string;
  plataforma: string;
  descripcion?: string;
  puntuacion: number | string;
  genero?: string;
  imagenUrl?: string;
}

export type VideojuegosList = Videojuego[];
