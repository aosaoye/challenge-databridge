# EJERCICIO 10 · Wander (Full Stack Challenge) 🌍

## Concepto
- **Integración Autónoma Full Stack**: Ciclo completo CRUD (`GET`, `POST`, `PATCH`, `DELETE`).
- **Persistencia**: PostgreSQL con TypeORM (`repository.create()`, `save()`, `find()`, `merge()`, `remove()`).
- **Base de Datos**: `databridge_e10`

## Reto Resuelto (MODIFÍCALO)
- Añade una **mejora propia coherente**:
  1. Propiedad `visitado: boolean` con endpoint específico `PATCH /destinos/:id/toggle-visitado`.
  2. Contador y filtro reactivo en la UI para alternar entre "Todos", "Pendientes" y "Visitados ✓".
  3. Cálculo automático del presupuesto total en tiempo real.
