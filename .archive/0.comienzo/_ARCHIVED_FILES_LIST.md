# Lista de Archivos Archivados - Fase 0

**Fecha**: 23 de Octubre, 2025  
**Fase**: Phase 3 - Folder Cleanup

---

## Archivos Removidos de `0.comienzo/`

### 1. Carpeta `documentation/` (completa)

**Ubicación original**: `0.comienzo/documentation/`  
**Estado**: Removida y archivada

**Archivos incluidos**:

```
documentation/
├── CHANGELOG.md                                # 102 líneas - Registro de cambios
├── DER_FASE0.md                                # 635 líneas - Diagrama lógico completo
├── MER_FASE0.md                                # 402 líneas - Modelo conceptual
├── README.md                                   # 258 líneas - Documentación general
├── SCHEMA.md                                   # 278 líneas - Especificación del esquema
├── Informe_DB_Gabriel_Osemberg.md              # 305 líneas - Informe académico
├── Informe_DB_Gabriel_Osemberg.txt             # 305 líneas - Informe (texto plano)
└── mermaid-diagrams/                           # 📁 Migrado a /diagramas
    ├── 01_MER_Fase0_Actual.md                  # Migrado → /diagramas/fase0/01_MER_Fase0.md
    ├── 02_DER_Fase0_Actual.md                  # Migrado → /diagramas/fase0/02_DER_Fase0.md
    ├── 03_MER_Fase1_Objetivo.md                # Contenido histórico
    ├── 04_DER_Fase1_Objetivo.md                # Contenido histórico
    ├── 05_Comparacion_Fase0_vs_Fase1.md        # Migrado → /diagramas/comparaciones/
    └── README.md                               # Índice de diagramas
```

### 2. Archivo `Ejecucion_fase0.md`

**Ubicación original**: `0.comienzo/Ejecucion_fase0.md`  
**Estado**: Archivado en `.archive/0.comienzo/Ejecucion_fase0.md`  
**Tamaño**: 324 líneas  
**Contenido**: Logs de ejecución de scripts de base de datos

---

## Contenido Preservado en Nueva Ubicación

### Diagramas → `/diagramas/fase0/`

Los diagramas Mermaid fueron consolidados en la carpeta raíz `/diagramas/` durante Phase 2:

- **MER Fase 0**: `/diagramas/fase0/01_MER_Fase0.md`
- **DER Fase 0**: `/diagramas/fase0/02_DER_Fase0.md`
- **Comparación**: `/diagramas/comparaciones/01_Fase0_vs_Fase1.md`

### README Mínimo → `0.comienzo/README.md`

Nuevo README creado (10-20 líneas) en español con:

- Objetivo de la fase
- Comandos de inicio rápido
- Enlaces de navegación

---

## Recuperación de Archivos

### Opción 1: Desde Archive

```bash
# Recuperar archivo individual
cp .archive/0.comienzo/ARCHIVO.md 0.comienzo/

# Recuperar carpeta documentation completa
cp -r .archive/0.comienzo/documentation/ 0.comienzo/
```

### Opción 2: Desde Git History

Todos los archivos están preservados en el historial de Git:

```bash
# Ver historial de un archivo
git log --follow 0.comienzo/documentation/DER_FASE0.md

# Restaurar desde commit anterior a la eliminación
git checkout <commit-hash> -- 0.comienzo/documentation/
```

---

## Justificación de la Remoción

### Problema Original

- **50+ archivos MD** distribuidos en el proyecto
- **Documentación redundante** (MER/DER en múltiples ubicaciones)
- **Sin punto de entrada claro** para evaluadores
- **Navegación confusa** entre fases

### Solución Implementada

1. **Root README**: Navegación principal (Phase 1)
2. **Carpeta `/diagramas`**: Consolidación visual (Phase 2)
3. **READMEs mínimos**: Por fase, esencial (Phase 3)
4. **GitHub Wiki**: Documentación detallada (Phase 4)

### Resultado

- ✅ Navegación clara y jerárquica
- ✅ Punto de entrada único
- ✅ Documentación esencial accesible
- ✅ Detalles técnicos preservados para referencia

---

## Estadísticas

| Categoría             | Cantidad | Tamaño Aprox. |
| --------------------- | -------- | ------------- |
| **Archivos MD**       | 13       | ~2,500 líneas |
| **Carpetas**          | 2        | -             |
| **Diagramas Mermaid** | 6        | ~1,000 líneas |
| **Total Archivado**   | 15+      | ~3,500 líneas |

---

## Migración a Wiki (Planificado)

Contenido que se migrará al GitHub Wiki:

- [ ] `Informe_DB_Gabriel_Osemberg.md` → Wiki: "Informe Técnico - Fase 0"
- [ ] `DER_FASE0.md` → Wiki: "Especificación Técnica - Fase 0"
- [ ] `MER_FASE0.md` → Wiki: "Modelo Conceptual - Fase 0"
- [ ] `CHANGELOG.md` → Wiki: "Historial de Cambios"
- [ ] `SCHEMA.md` → Wiki: "Documentación del Esquema"

---

**Archivado durante**: Phase 3 - Folder Cleanup  
**Próximo paso**: Phase 4 - GitHub Wiki Setup  
**Estado**: ✅ Completo - Todo el contenido preservado
