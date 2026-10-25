# EJERCICIO 09 · Event Radar 🎟️

## Concepto
- **Consultar y filtrar con Query Params**: `GET /eventos?ciudad=Zaragoza&categoria=Tecnología`
- **Operaciones TypeORM**: `repository.find({ where })` dinámico
- **Base de Datos**: `databridge_e09`

## Reto Resuelto (MODIFÍCALO)
- Combina los filtros de **ciudad** y **categoría** en una misma consulta opcional.
- Si no se envía un filtro o se selecciona "Todas", no restringe ese criterio.
- La aplicación móvil actualiza la URL en tiempo real y muestra los resultados obtenidos de PostgreSQL.
