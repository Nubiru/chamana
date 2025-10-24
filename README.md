# CHAMANA Database - Proyecto de Normalización

## Gabriel Osemberg

### 🎯 Inicio Rápido para Evaluadores

Este proyecto demuestra la normalización progresiva de bases de datos desde una línea base pre-normalizada hasta la Segunda Forma Normal (2NF), aplicada a un negocio real de comercio electrónico de ropa femenina (CHAMANA). El proyecto incluye documentación completa de esquemas, diagramas MER/DER, y una aplicación web funcional que muestra cada fase de normalización.

### 📂 Ruta de Exploración Recomendada

1. **COMIENZA AQUÍ**: [`/diagramas`](./diagramas) - Progresión visual de normalización con diagramas MER/DER (5 min)
2. **Fase 0**: [`/0.comienzo`](./0.comienzo) - Línea base pre-normalizada con redundancia intencional (3 min)
3. **Fase 1**: [`/1.normalizacion`](./1.normalizacion) - Primera Forma Normal (1NF): Valores atómicos, sin grupos repetitivos (3 min)
4. **Fase 2**: [`/2.relaciones`](./2.relaciones) - Segunda Forma Normal (2NF): Eliminación de dependencias parciales (3 min)
5. **OPCIONAL**: GitHub Wiki - Documentación técnica completa, logs de ejecución, decisiones de diseño (10+ min)
6. **OPCIONAL**: Ejecutar la Aplicación - Demostración en vivo de la base de datos e interfaz web (5 min)

**Tiempo total de evaluación**: ~15 minutos para revisión básica, 30+ minutos para análisis completo

### 📊 Logros Clave

- ✅ **Progresión completa de normalización**: Pre-normalizado → 1NF → 2NF con documentación clara de cada transformación
- ✅ **Datos reales del negocio**: 31 productos auténticos de CHAMANA, 20 clientes, 5 categorías de ropa (Buzo, Remera, Vestido, Palazzo, Pantalón)
- ✅ **Implementación full-stack**: Base de datos PostgreSQL 15+ con backend Node.js/Express y frontend JavaScript vanilla
- ✅ **Documentación exhaustiva**: Diagramas MER/DER para cada fase, informes técnicos, guías de migración, y logs de ejecución
- ✅ **Estructura profesional**: Organización limpia del código, historial Git rastreando la progresión, implementaciones aisladas por fase

### 🔗 Análisis Profundo (Opcional)

Para documentación técnica completa más allá del alcance de la evaluación rápida:

- **📖 GitHub Wiki**: [Documentación Técnica Completa](../../wiki)
  - Visión general del proyecto y objetivos
  - Documentación detallada de cada fase (0, 1, 2)
  - Referencia completa de esquemas por fase
  - Guías paso a paso de migración entre fases
  - Decisiones de diseño con justificaciones técnicas
  - Ejemplos de código SQL y queries complejos
- **📊 Diagramas Visuales**: Ver carpeta [`/diagramas`](./diagramas) para todos los diagramas MER/DER con vistas de comparación
- **📁 Documentación Archivada**: Logs de ejecución y metadata disponibles en carpeta `.archive/` (preservados como referencia)

### 🚀 Ejecutar la Aplicación

**Requisitos Previos**: PostgreSQL 15+, Node.js 18+

**Inicio Rápido** (cada fase es independiente):

```bash
# Fase 0: Línea base pre-normalizada
cd 0.comienzo/database/scripts
npm install && node 00_db.js

# Fase 1: Primera Forma Normal (1NF)
cd ../../../1.normalizacion/database/scripts
npm install && node 00_db.js

# Fase 2: Segunda Forma Normal (2NF)
cd ../../../2.relaciones/database/scripts
npm install && node 00_db.js

# Ejecutar aplicación web (cualquier fase)
cd ../../web
npm install && npm start
# Acceder: http://localhost:3000
```

**Nota**: Cada fase crea una base de datos independiente (`chamana_db_fase0`, `chamana_db_fase1`, `chamana_db_fase2`) para comparación.

Ver los READMEs específicos de cada fase para instrucciones detalladas de configuración y resolución de problemas.

### 📞 Contacto e Información

**Estudiante**: Gabriel Osemberg  
**Curso**: Diseño de Bases de Datos y Normalización  
**Institución**: Universidad  
**Fecha**: Octubre 2025  
**Tecnologías**: PostgreSQL 15+, Node.js 18+, Express.js, JavaScript Vanilla

**Repositorio**: [GitHub](https://github.com/USER/gabriel-db-final) _(actualizar con URL real)_

---

**Tipo de Proyecto**: Académico (doble propósito: proyecto universitario + fundación de CRM lista para producción)  
**Licencia**: Uso Educativo  
**Estado**: Fases 0-2 Completas ✅ | Fase 3+ En Progreso 🚧

**Última Actualización**: 23 de Octubre, 2025
