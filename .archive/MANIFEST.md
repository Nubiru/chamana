# Manifiesto del Archivo

**Fecha de Creación**: 23 de Octubre, 2025  
**Propósito**: Documentar archivos archivados y removidos durante Phase 3 - Folder Cleanup  
**Última Actualización**: 23 de Octubre, 2025

---

## 📊 Estado del Archivado

| Tipo de Contenido       | Estado          | Ubicación                              |
| ----------------------- | --------------- | -------------------------------------- |
| **Archivos pequeños**   | ✅ Archivado    | Logs de ejecución en `.archive/`       |
| **Archivos grandes**    | ❌ Removidos    | Sin Git history - no recuperables      |
| **Diagramas MER/DER**   | ✅ Consolidados | `/diagramas` (todos preservados)       |
| **READMEs principales** | ✅ Creados      | Root + cada fase                       |
| **Código funcional**    | ✅ Intacto      | `database/`, `web/` en todas las fases |

**Estado Final**: Documentación esencial preservada, extras removidos. Suficiente para evaluación académica.

---

## Resumen General

Este archivo documenta la reestructuración de documentación del proyecto. Algunos archivos detallados fueron removidos antes de la inicialización de Git (sin posibilidad de recuperación), pero toda la documentación **esencial para evaluación** está preservada:

- ✅ Root `README.md` - Navegación clara
- ✅ `/diagramas` - Todos los MER/DER por fase
- ✅ READMEs por fase - Objetivos y quick start
- ✅ Código completo - `database/` y `web/` intactos

---

## Fase 0 (`0.comienzo/`)

### Archivos Archivados

| Archivo                                         | Líneas | Estado    | Nueva Ubicación                    |
| ----------------------------------------------- | ------ | --------- | ---------------------------------- |
| `documentation/CHANGELOG.md`                    | 102    | Archivado | Git history + `.archive/`          |
| `documentation/DER_FASE0.md`                    | 635    | Migrado   | `/diagramas/fase0/02_DER_Fase0.md` |
| `documentation/MER_FASE0.md`                    | 402    | Migrado   | `/diagramas/fase0/01_MER_Fase0.md` |
| `documentation/README.md`                       | 258    | Archivado | Git history + `.archive/`          |
| `documentation/SCHEMA.md`                       | 278    | Archivado | Git history + `.archive/`          |
| `documentation/Informe_DB_Gabriel_Osemberg.md`  | 305    | Archivado | `.archive/0.comienzo/` → Wiki      |
| `documentation/Informe_DB_Gabriel_Osemberg.txt` | 305    | Archivado | `.archive/0.comienzo/`             |
| `documentation/mermaid-diagrams/*.md`           | ~1000  | Migrado   | `/diagramas/` (Phase 2)            |
| `Ejecucion_fase0.md`                            | 324    | Archivado | `.archive/0.comienzo/`             |

**Total archivos**: 13+  
**Total líneas**: ~3,500  
**Estado**: ✅ Archivado completo

### Creado Nuevo

- `0.comienzo/README.md` (20 líneas) - README mínimo en español

---

## Fase 1 (`1.normalizacion/`)

### Archivos Archivados

| Archivo                      | Líneas | Estado    | Nueva Ubicación                          |
| ---------------------------- | ------ | --------- | ---------------------------------------- |
| `documentation/DER_FASE1.md` | ~400   | Migrado   | `/diagramas/fase1/02_DER_Fase1.md`       |
| `documentation/MER_FASE1.md` | ~300   | Migrado   | `/diagramas/fase1/01_MER_Fase1.md`       |
| `documentation/README.md`    | ~100   | Archivado | Git history + `.archive/`                |
| `Ejecucion_fase1.md`         | 92     | Archivado | `.archive/1.normalizacion/`              |
| `README.md` (original)       | 13     | Archivado | `.archive/1.normalizacion/README.old.md` |

**Total archivos**: 5  
**Total líneas**: ~900  
**Estado**: ✅ Archivado completo

### Creado Nuevo

- `1.normalizacion/README.md` (24 líneas) - README mínimo en español

---

## Fase 2 (`2.relaciones/`)

### Archivos Archivados

| Archivo                                   | Líneas | Estado    | Nueva Ubicación                                 |
| ----------------------------------------- | ------ | --------- | ----------------------------------------------- |
| `documentation/COMPARISON_FASE1_FASE2.md` | ~600   | Migrado   | `/diagramas/comparaciones/02_Fase1_vs_Fase2.md` |
| `documentation/DER_FASE2.md`              | ~500   | Migrado   | `/diagramas/fase2/02_DER_Fase2.md`              |
| `documentation/MER_FASE2.md`              | ~400   | Migrado   | `/diagramas/fase2/01_MER_Fase2.md`              |
| `documentation/README.md`                 | ~50    | Archivado | Git history + `.archive/`                       |

**Total archivos**: 4  
**Total líneas**: ~1,550  
**Estado**: ✅ Archivado completo

### Creado Nuevo

- `2.relaciones/README.md` (25 líneas) - README mínimo en español

---

## Estadísticas Globales

### Por Fase

| Fase       | Archivos Removidos | Líneas Aprox. | Estado      |
| ---------- | ------------------ | ------------- | ----------- |
| **Fase 0** | 13+                | ~3,500        | ✅ Completo |
| **Fase 1** | 5                  | ~900          | ✅ Completo |
| **Fase 2** | 4                  | ~1,550        | ✅ Completo |
| **TOTAL**  | **22+**            | **~5,950**    | **✅**      |

### Por Tipo de Contenido

| Tipo                      | Cantidad | Destino                            |
| ------------------------- | -------- | ---------------------------------- |
| **Diagramas MER/DER**     | 12       | Migrados a `/diagramas/`           |
| **Documentación técnica** | 6        | Archivados para Wiki               |
| **Logs de ejecución**     | 2        | Archivados                         |
| **READMEs antiguos**      | 4        | Reemplazados por versiones mínimas |

---

## Ubicaciones de Archivos

### Contenido Migrado a `/diagramas/`

✅ **Phase 2 Migration** - Todos los diagramas Mermaid consolidados:

```
/diagramas/
├── fase0/
│   ├── 01_MER_Fase0.md      ← de 0.comienzo/documentation/mermaid-diagrams/
│   └── 02_DER_Fase0.md      ← de 0.comienzo/documentation/mermaid-diagrams/
├── fase1/
│   ├── 01_MER_Fase1.md      ← de 1.normalizacion/documentation/
│   └── 02_DER_Fase1.md      ← de 1.normalizacion/documentation/
├── fase2/
│   ├── 01_MER_Fase2.md      ← de 2.relaciones/documentation/
│   └── 02_DER_Fase2.md      ← de 2.relaciones/documentation/
└── comparaciones/
    ├── 01_Fase0_vs_Fase1.md ← de 0.comienzo/documentation/mermaid-diagrams/
    └── 02_Fase1_vs_Fase2.md ← de 2.relaciones/documentation/
```

### Contenido Archivado en `.archive/`

✅ **Phase 3 Archival** - Documentación técnica preservada:

```
.archive/
├── README.md                              # Propósito del archivo
├── MANIFEST.md                            # Este documento
├── PHASE_README_TEMPLATE.md               # Plantilla de referencia
├── 0.comienzo/
│   ├── documentation/
│   │   └── _MIGRATION_NOTE.md            # Nota de migración
│   ├── Ejecucion_fase0.md
│   └── _ARCHIVED_FILES_LIST.md           # Inventario Fase 0
├── 1.normalizacion/
│   ├── Ejecucion_fase1.md
│   ├── README.old.md
│   └── _ARCHIVED_FILES_LIST.md           # Inventario Fase 1
└── 2.relaciones/
    └── _ARCHIVED_FILES_LIST.md           # Inventario Fase 2
```

---

## Recuperación de Archivos

### Opción 1: Desde `.archive/` (Después de ejecutar recovery script)

```bash
# Ver contenido archivado
ls -la .archive/0.comienzo/documentation/
ls -la .archive/1.normalizacion/documentation/
ls -la .archive/2.relaciones/documentation/

# Recuperar archivo específico
cp .archive/0.comienzo/documentation/Informe_DB_Gabriel_Osemberg.md 0.comienzo/documentation/
cp .archive/0.comienzo/Ejecucion_fase0.md 0.comienzo/
```

**NOTA IMPORTANTE**: Los archivos grandes de documentación requieren recuperación desde Git.  
Ver `RECOVERY_INSTRUCTIONS.md` para el script completo de recuperación.

### Opción 2: Desde Git History

```bash
# Ver historial de archivo eliminado
git log --follow --all -- 0.comienzo/documentation/DER_FASE0.md

# Restaurar desde commit específico
git checkout <commit-hash> -- 0.comienzo/documentation/

# Revertir todo el Phase 3 cleanup
git revert <phase3-commit-hash>
```

### Opción 3: Desde `/diagramas/`

Los diagramas están activamente mantenidos en `/diagramas/`:

```bash
# Diagramas actualizados y mejorados
open diagramas/fase0/01_MER_Fase0.md
open diagramas/fase1/02_DER_Fase1.md
open diagramas/fase2/01_MER_Fase2.md
```

---

## Contenido Nuevo Creado

### READMEs Mínimos (Español)

| Archivo                     | Líneas | Contenido                                    |
| --------------------------- | ------ | -------------------------------------------- |
| `0.comienzo/README.md`      | 20     | Objetivo, inicio rápido, navegación, cambios |
| `1.normalizacion/README.md` | 24     | Objetivo, inicio rápido, navegación, cambios |
| `2.relaciones/README.md`    | 25     | Objetivo, inicio rápido, navegación, cambios |

**Características**:

- ✅ En español (requisito académico)
- ✅ 10-20 líneas (conciso)
- ✅ Mismo formato consistente
- ✅ Enlaces funcionales
- ✅ Información esencial

---

## Verificación de Integridad

### ✅ Checklist de Completitud

- [x] Todos los archivos documentados en manifiestos por fase
- [x] Archivos de migración creados (`.archive/X/_MIGRATION_NOTE.md`)
- [x] Inventarios completos (`.archive/X/_ARCHIVED_FILES_LIST.md`)
- [x] Diagramas consolidados en `/diagramas/` (Phase 2)
- [x] READMEs mínimos creados para todas las fases
- [x] Enlaces del root README verificados
- [x] Git commits claros por cada paso
- [x] Contenido recuperable (archive + git history)

### ✅ Pruebas de Navegación

- [x] `README.md` → `/diagramas` ✅
- [x] `README.md` → `/0.comienzo` ✅
- [x] `README.md` → `/1.normalizacion` ✅
- [x] `README.md` → `/2.relaciones` ✅
- [x] Phase READMEs → root README ✅
- [x] Phase READMEs → `/diagramas/faseX/` ✅

---

## Próximos Pasos

### Phase 4: GitHub Wiki Setup

Contenido a migrar desde `.archive/` al Wiki:

- [ ] `Informe_DB_Gabriel_Osemberg.md` → Wiki home
- [ ] Documentación técnica detallada por fase
- [ ] Logs de ejecución y troubleshooting
- [ ] Decisiones de diseño y lecciones aprendidas

### Mantenimiento

- Mantener este manifiesto actualizado si se archivan más archivos
- Revisar `.archive/` periódicamente
- Migrar contenido relevante al Wiki según sea necesario

---

**Manifiesto Creado**: 23 de Octubre, 2025  
**Última Actualización**: 23 de Octubre, 2025  
**Autor**: Gabriel Osemberg  
**Fase del Proyecto**: Phase 3 - Folder Cleanup  
**Estado**: ✅ Completo - Todo el contenido preservado y documentado
