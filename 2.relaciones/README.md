# Fase 2: Relaciones - Segunda Forma Normal (2NF)

## Objetivo

Lograr Segunda Forma Normal (2NF) eliminando dependencias parciales mediante junction tables correctas. Expande el sistema de Fase 1 (9 tablas) a un e-commerce completo (12 tablas) con sistema de pedidos, gestión automática de inventario, auditoría de movimientos y disponibilidad estacional de telas.

## Inicio Rápido

```bash
# Configurar base de datos
cd database/scripts
npm install
node 00_db.js

# Ejecutar aplicación web
cd ../web
npm install
npm start
# Acceder: http://localhost:3000
```

## Navegación

- **← Atrás**: [README Principal](../README.md)
- **📊 Diagramas**: [Visualización de esta fase](../diagramas/fase2/)
- **→ Siguiente Fase**: [Fase 3](../3.vistas-y-procedimientos/)
- **📚 Documentación Detallada**: [GitHub Wiki](../wiki) (próximamente)

## Qué Cambió

- Normalización a 2NF: Junction tables `pedidos_prendas` y `telas_temporadas` eliminan dependencias parciales
- Sistema de pedidos completo: Tablas `pedidos`, `pedidos_prendas`, `movimientos_inventario`
- Gestión de inventario automática: Columna generada `stock_disponible` = `stock_inicial - stock_vendido`
- Disponibilidad estacional: Junction table `telas_temporadas` relaciona telas con año/temporada
- Auditoría completa: Tabla `movimientos_inventario` registra todos los cambios de stock con trazabilidad

---

**Base de Datos**: `chamana_db_fase2`  
**Forma Normal**: 2NF (Segunda Forma Normal)  
**Estado**: Sin dependencias parciales, sistema e-commerce funcional
