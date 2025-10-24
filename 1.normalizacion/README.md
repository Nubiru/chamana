# Fase 1: Normalización - Primera Forma Normal (1NF)

## Objetivo

Lograr Primera Forma Normal (1NF) separando valores no atómicos en tablas independientes. Transforma el diseño pre-normalizado de Fase 0 extrayendo "diseños" y "telas" en entidades propias, eliminando redundancia y estableciendo relaciones claras. Expande de 3 a 9 tablas, introduciendo colecciones estacionales.

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
- **📊 Diagramas**: [Visualización de esta fase](../diagramas/fase1/)
- **→ Siguiente Fase**: [Fase 2: Relaciones](../2.relaciones/)
- **📚 Documentación Detallada**: [GitHub Wiki](../wiki) (próximamente)

## Qué Cambió

- Normalización a 1NF: Separación de `nombre_completo` en tablas `disenos` y `telas`
- Expansión de 3 a 9 tablas: Añadidas `disenos`, `telas`, `años`, `temporadas`, `colecciones`
- Eliminación de redundancia: Campo `tela_nombre` reemplazado por `tela_id` (FK)
- Sistema de colecciones estacionales: Organización por año y temporada (Verano/Invierno)

---

**Base de Datos**: `chamana_db_fase1`  
**Forma Normal**: 1NF (Primera Forma Normal)  
**Estado**: Valores atómicos, sin grupos repetitivos
