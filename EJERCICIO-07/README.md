# EJERCICIO 07 · Sneaker Vault 👟

## Concepto
- **CRUD completo**: `GET /sneakers`, `POST /sneakers`, `PATCH /sneakers/:id`, `DELETE /sneakers/:id`
- **Operaciones TypeORM**: `repository.create()`, `repository.save()`, `repository.find()`, `repository.merge()`, `repository.remove()`
- **Base de Datos**: `databridge_e07`

## Reto Resuelto (MODIFÍCALO)
- Añade el campo **`stock`** a la Entity `sneaker.entity.ts` y a los DTOs.
- En la interfaz de React Native, si `stock === 0`, muestra de forma reactiva el badge **`AGOTADO`**.
- La palabra `AGOTADO` no se guarda como texto en la base de datos: el dato persistente se mantiene numérico (`stock: 0`) y la vista deriva la representación visual.
