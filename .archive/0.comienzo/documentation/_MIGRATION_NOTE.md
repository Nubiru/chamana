# Nota de Migración - Documentación de Fase 0

**Fecha de Archivo**: 23 de Octubre, 2025  
**Razón**: Reestructuración de documentación del proyecto

---

## Archivos Archivados

Esta carpeta contiene la documentación original de la Fase 0 que fue removida durante la reestructuración del proyecto.

### Estructura Original Archivada

```
0.comienzo/documentation/
├── CHANGELOG.md                    # Registro de cambios de Fase 0
├── DER_FASE0.md                    # Diagrama Entidad-Relación (lógico)
├── MER_FASE0.md                    # Modelo Entidad-Relación (conceptual)
├── README.md                       # Documentación general de Fase 0
├── SCHEMA.md                       # Documentación del esquema
├── Informe_DB_Gabriel_Osemberg.md  # Informe académico completo
├── Informe_DB_Gabriel_Osemberg.txt # Informe (formato texto)
└── mermaid-diagrams/               # Diagramas Mermaid (migrados a /diagramas)
    ├── 01_MER_Fase0_Actual.md
    ├── 02_DER_Fase0_Actual.md
    ├── 03_MER_Fase1_Objetivo.md
    ├── 04_DER_Fase1_Objetivo.md
    ├── 05_Comparacion_Fase0_vs_Fase1.md
    └── README.md
```

---

## Nueva Ubicación del Contenido

### Diagramas Mermaid → `/diagramas`

Los diagramas MER/DER han sido consolidados en la carpeta raíz `/diagramas`:

- **Diagramas de Fase 0**: [`/diagramas/fase0/`](../../../diagramas/fase0/)
  - `01_MER_Fase0.md` - Modelo conceptual
  - `02_DER_Fase0.md` - Diagrama lógico

### Documentación Esencial → `0.comienzo/README.md`

La documentación esencial de la fase se concentra ahora en un README mínimo en español.

### Documentación Detallada → GitHub Wiki (próximamente)

Toda la documentación técnica detallada (informes, análisis, decisiones de diseño) se migrará al GitHub Wiki del proyecto.

---

## Recuperación de Archivos

Para restaurar algún archivo de esta carpeta:

```bash
# Restaurar un archivo específico
cp .archive/0.comienzo/documentation/ARCHIVO.md 0.comienzo/documentation/

# Restaurar toda la carpeta
cp -r .archive/0.comienzo/documentation/ 0.comienzo/
```

---

## Contenido Preservado

✅ Todos los archivos originales están preservados en esta carpeta  
✅ Ningún contenido se ha perdido  
✅ Los diagramas están disponibles en `/diagramas` (mejorados)  
✅ El historial completo está en Git

---

**Archivado por**: Documentación Restructuring Phase 3  
**Contacto**: Gabriel Osemberg
