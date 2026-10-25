# EJERCICIO 05 · Travel Book ✈️

## Concepto
- **Actualizar datos**: `PATCH /viajes/:id`
- **Operaciones TypeORM**: `repository.findOne()`, `repository.merge()`, `repository.save()`
- **Base de Datos**: `databridge_e05`

## Reto Resuelto (MODIFÍCALO)
- Permite editar también la **fecha** además del **estado** y verifica que permanece después de reiniciar.
- El campo `fecha` viaja en la Entity `viaje.entity.ts`, en el DTO `update-viaje.dto.ts` y en el formulario de la app móvil.
