export type Pelicula = {
  id: number;
  titulo: string;
  descripcion: string;
  genero: string;
  anio: number;
  puntuacion: number | string;
  imagenUrl: string;
  favorita: boolean;
};

export interface CarouselItem {
  id: string;
  image: string;
  backdropImage?: string;
  pelicula: Pelicula;
}
