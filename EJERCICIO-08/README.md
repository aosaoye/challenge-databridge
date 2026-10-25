# EJERCICIO 08 · My Playlists 🎵

## Concepto
- **Relaciones TypeORM**: `@OneToMany` (Playlist -> Canciones) y `@ManyToOne` (Cancion -> Playlist) con clave foránea.
- **Carga de relaciones**: `relations: ['canciones']`
- **Base de Datos**: `databridge_e08`

## Reto Resuelto (MODIFÍCALO)
- Permite añadir una canción a una playlist concreta con `POST /playlists/:id/canciones`.
- La canción queda asociada mediante la clave foránea a la entidad Playlist y se recupera automáticamente en la lista de canciones.
