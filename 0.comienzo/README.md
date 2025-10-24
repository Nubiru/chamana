# Fase 0: Comienzo - Línea Base Pre-Normalizada

## Objetivo

Establecer la estructura base de la base de datos con denormalización intencional para propósitos pedagógicos. Demuestra el estado inicial antes de aplicar principios de normalización, utilizando 3 tablas simples con redundancia intencional de datos.

## Inicio Rápido

```bash
# Configurar base de datos
cd database/scripts
npm install
node 00_db.js

# Ejecutar aplicación web
cd ../../web
npm install
npm start
# Acceder: http://localhost:3000
```

## Navegación

- **← Atrás**: [README Principal](../README.md)
- **📊 Diagramas**: [Visualización de esta fase](../diagramas/fase0/)
- **→ Siguiente Fase**: [Fase 1: Normalización](../1.normalizacion/)
- **📚 Documentación Detallada**: [GitHub Wiki](../wiki) (próximamente)

## Qué Cambió

- Estructura inicial de 3 tablas (clientes, categorias, prendas)
- Redundancia de datos intencional: `nombre_completo` combina diseño+tela, `tela_nombre` se repite
- Datos reales del negocio: 31 productos CHAMANA, 20 clientes, 5 categorías de ropa
- Pre-normalizado (~1NF parcial) - Punto de partida para aprender normalización

---

**Base de Datos**: `chamana_db_fase0`  
**Forma Normal**: Pre-normalizado (~1NF parcial)  
**Estado**: Línea base intencional para demostrar problemas de diseño
