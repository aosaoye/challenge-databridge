# EJERCICIO 06 · My Library 📚

## Concepto
- **Eliminar y sincronizar la interfaz**: `DELETE /libros/:id`
- **Operaciones TypeORM**: `repository.find()`, `repository.findOne()`, `repository.remove()`
- **Base de Datos**: `databridge_e06`

## Reto Resuelto (MODIFÍCALO)
- Añade **Marcar como leído** utilizando `PATCH /libros/:id/leido`.
- La Entity `libro.entity.ts` incluye la columna `leido: boolean`.
- La interfaz de React Native permite alternar entre leído y pendiente mediante PATCH, y eliminar libros con DELETE sincronizando la memoria local.
