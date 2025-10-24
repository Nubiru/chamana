# Diagramas - Normalización de Base de Datos CHAMANA

**Proyecto**: CHAMANA E-commerce de Ropa Femenina  
**Estudiante**: Gabriel Osemberg  
**Propósito**: Visualización de la progresión de normalización (Pre-normalizado → 1NF → 2NF)

---

## 📋 Resumen General

Esta carpeta contiene todos los diagramas que documentan la evolución de la base de datos CHAMANA a través de las diferentes fases de normalización. Cada fase incluye:

- **MER (Modelo Entidad-Relación)**: Diagrama conceptual que muestra entidades y sus relaciones
- **DER (Diagrama Entidad-Relación)**: Diagrama lógico con tipos de datos y especificaciones técnicas
- **Comparaciones**: Visualización de cambios entre fases consecutivas

---

## 🔍 Cómo Visualizar los Diagramas

### Opción 1: VS Code con Extensión Mermaid (Recomendado)

1. Instalar extensión: **Markdown Preview Mermaid Support**
2. Abrir cualquier archivo `.md` de esta carpeta
3. Click derecho → "Open Preview" (o `Ctrl+Shift+V`)
4. Los diagramas se renderizarán automáticamente

### Opción 2: Mermaid Live Editor (Online)

1. Visitar: [mermaid.live](https://mermaid.live)
2. Copiar el código Mermaid del archivo
3. Pegar en el editor online
4. Visualizar y exportar a PNG/SVG

### Opción 3: GitHub (Automático)

- GitHub renderiza diagramas Mermaid automáticamente
- Simplemente abre cualquier archivo `.md` en el navegador

---

## 📊 Índice Rápido

### Diagramas por Fase

| Fase   | MER (Conceptual)                       | DER (Lógico)                           | Comparación                                          |
| ------ | -------------------------------------- | -------------------------------------- | ---------------------------------------------------- |
| Fase 0 | [📄 MER Fase 0](fase0/01_MER_Fase0.md) | [📄 DER Fase 0](fase0/02_DER_Fase0.md) | [🔄 vs Fase 1](comparaciones/01_Fase0_vs_Fase1.md)   |
| Fase 1 | [📄 MER Fase 1](fase1/01_MER_Fase1.md) | [📄 DER Fase 1](fase1/02_DER_Fase1.md) | [🔄 vs Fase 2](comparaciones/02_Fase1_vs_Fase2.md)   |
| Fase 2 | [📄 MER Fase 2](fase2/01_MER_Fase2.md) | [📄 DER Fase 2](fase2/02_DER_Fase2.md) | [🔄 Comparación](comparaciones/02_Fase1_vs_Fase2.md) |

### Acceso Rápido por Tipo

**Diagramas Conceptuales (MER)**:

- [Fase 0: Pre-normalizado](fase0/01_MER_Fase0.md)
- [Fase 1: Primera Forma Normal (1NF)](fase1/01_MER_Fase1.md)
- [Fase 2: Segunda Forma Normal (2NF)](fase2/01_MER_Fase2.md)

**Diagramas Lógicos (DER)**:

- [Fase 0: Especificación Técnica Base](fase0/02_DER_Fase0.md)
- [Fase 1: Especificación Técnica 1NF](fase1/02_DER_Fase1.md)
- [Fase 2: Especificación Técnica 2NF](fase2/02_DER_Fase2.md)

**Comparaciones**:

- [Fase 0 vs Fase 1: Normalización a 1NF](comparaciones/01_Fase0_vs_Fase1.md)
- [Fase 1 vs Fase 2: Normalización a 2NF](comparaciones/02_Fase1_vs_Fase2.md)

---

## 📖 Leyenda

### MER (Modelo Entidad-Relación - Conceptual)

**Propósito**: Mostrar la estructura conceptual de la base de datos sin detalles técnicos

**Elementos**:

- **Entidades**: Representan objetos del negocio (CLIENTE, PRENDA, PEDIDO)
- **Relaciones**: Conexiones entre entidades (1:N, N:M)
- **Atributos**: Propiedades de las entidades (nombre, email, precio)

**Cuándo usar**: Para entender la lógica de negocio y relaciones entre conceptos

---

### DER (Diagrama Entidad-Relación - Lógico)

**Propósito**: Mostrar la implementación técnica con tipos de datos y restricciones

**Elementos**:

- **Tablas**: Representan entidades con nombres en minúsculas (clientes, prendas)
- **Columnas**: Incluyen tipos de datos (VARCHAR, INTEGER, DECIMAL)
- **Restricciones**: NOT NULL, UNIQUE, CHECK, DEFAULT
- **Claves Foráneas (FK)**: Referencias entre tablas

**Cuándo usar**: Para implementar la base de datos o entender especificaciones técnicas

---

## 🎯 Progresión de Normalización

### Fase 0: Pre-normalizado

- **3 tablas** (clientes, categorias, prendas)
- **1 relación**
- **~1NF parcial** (algunos valores no atómicos)
- **Intencional**: Para demostrar problemas de diseño

**Problemas**:

- `nombre_completo` combina diseño + tela (no atómico)
- `tela_nombre` se repite (redundancia)

---

### Fase 1: Primera Forma Normal (1NF)

- **9 tablas** (+6 nuevas)
- **8 relaciones** (+7)
- **1NF completa** (valores atómicos, sin grupos repetidos)

**Mejoras**:

- ✅ Diseños y telas en tablas separadas
- ✅ Colecciones estacionales (años + temporadas)
- ✅ Sin redundancia de datos

---

### Fase 2: Segunda Forma Normal (2NF)

- **12 tablas** (+3 nuevas)
- **15 relaciones** (+7)
- **2NF completa** (sin dependencias parciales)

**Mejoras**:

- ✅ Sistema de pedidos completo
- ✅ Junction tables correctas (`pedidos_prendas`, `telas_temporadas`)
- ✅ Gestión de inventario automática
- ✅ Auditoría de stock

---

## 📁 Estructura de Carpetas

```
/diagramas/
├── README.md                          # Este archivo (índice maestro)
│
├── fase0/                             # Fase 0: Pre-normalizado
│   ├── 01_MER_Fase0.md                # Modelo conceptual
│   ├── 02_DER_Fase0.md                # Modelo lógico
│   └── images/                        # Exportaciones PNG/SVG (futuro)
│       └── .gitkeep
│
├── fase1/                             # Fase 1: Primera Forma Normal (1NF)
│   ├── 01_MER_Fase1.md                # Modelo conceptual
│   ├── 02_DER_Fase1.md                # Modelo lógico
│   └── images/                        # Exportaciones PNG/SVG (futuro)
│       └── .gitkeep
│
├── fase2/                             # Fase 2: Segunda Forma Normal (2NF)
│   ├── 01_MER_Fase2.md                # Modelo conceptual
│   ├── 02_DER_Fase2.md                # Modelo lógico
│   └── images/                        # Exportaciones PNG/SVG (futuro)
│       └── .gitkeep
│
└── comparaciones/                     # Comparaciones entre fases
    ├── 01_Fase0_vs_Fase1.md           # Evolución Pre-norm → 1NF
    ├── 02_Fase1_vs_Fase2.md           # Evolución 1NF → 2NF
    └── images/                        # Exportaciones PNG/SVG (futuro)
        └── .gitkeep
```

---

## 🖼️ Exportar Diagramas a Imágenes

### Desde VS Code

1. Instalar extensión: **Mermaid Markdown Syntax Highlighting**
2. Click derecho en el código Mermaid → "Export Mermaid Diagram"
3. Elegir formato: PNG o SVG
4. Guardar en carpeta `images/` correspondiente

### Desde Mermaid Live

1. Abrir [mermaid.live](https://mermaid.live)
2. Pegar código Mermaid
3. Click en "Download" → PNG o SVG
4. Guardar en carpeta `images/` correspondiente

### Nombres de Archivo Sugeridos

```
fase0/images/
├── MER_Fase0_Pre-normalizado.png
└── DER_Fase0_Pre-normalizado.png

fase1/images/
├── MER_Fase1_1NF.png
└── DER_Fase1_1NF.png

fase2/images/
├── MER_Fase2_2NF.png
└── DER_Fase2_2NF.png

comparaciones/images/
├── Comparacion_Fase0_vs_Fase1.png
└── Comparacion_Fase1_vs_Fase2.png
```

---

## 🔗 Enlaces Adicionales

### Documentación del Proyecto

- [README Principal](../README.md) - Navegación general del proyecto
- [Fase 0: Documentación](../0.comienzo/README.md)
- [Fase 1: Documentación](../1.normalizacion/README.md)
- [Fase 2: Documentación](../2.relaciones/README.md)

### Recursos Externos

- [Mermaid Syntax Documentation](https://mermaid.js.org/syntax/entityRelationshipDiagram.html)
- [Mermaid Live Editor](https://mermaid.live)
- [Database Normalization Guide](https://en.wikipedia.org/wiki/Database_normalization)

---

## 📊 Estadísticas de Diagramas

| Métrica                | Fase 0 | Fase 1 | Fase 2 |
| ---------------------- | ------ | ------ | ------ |
| **Tablas**             | 3      | 9      | 12     |
| **Entidades en MER**   | 3      | 9      | 12     |
| **Relaciones**         | 1      | 8      | 15     |
| **Junction Tables**    | 0      | 0      | 2      |
| **Columnas Generadas** | 0      | 0      | 1      |
| **Foreign Keys**       | 1      | 6      | 14     |

---

## 🎓 Valor Educativo

Estos diagramas demuestran:

1. **Progresión Metodológica**: Normalización paso a paso desde un diseño intencional no óptimo
2. **Decisiones de Diseño**: Cada cambio está justificado por principios de normalización
3. **Comparación Visual**: Fácil ver mejoras entre fases
4. **Documentación Completa**: MER + DER + Comparaciones = visión 360°
5. **Caso Real**: Basado en negocio real (CHAMANA e-commerce de ropa femenina)

---

## 📞 Contacto

**Estudiante**: Gabriel Osemberg  
**Proyecto**: CHAMANA Database - Normalización  
**Curso**: Diseño de Bases de Datos  
**Fecha**: Octubre 2025

---

**Última Actualización**: 23 de Octubre, 2025  
**Total de Diagramas**: 8 archivos (6 diagramas principales + 2 comparaciones)  
**Herramientas**: Mermaid.js, PostgreSQL, VS Code
