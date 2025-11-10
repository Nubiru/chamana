# Inicio Rápido - Ejecutar Scripts de Migración de Base de Datos

## 🚀 Ruta Rápida (5 minutos)

### Paso 1: Instalar Dependencias

```bash
cd 4.final/database/scripts
npm install
```

### Paso 2: Ejecutar Todos los Scripts

```bash
npm run migrate
```

¡Eso es todo! Los 5 scripts se ejecutarán en orden.

---

## 🐛 Solución de Problemas

### ❌ Error: "Cannot find module 'bcrypt'"

**Solución**:

```bash
npm install
```

### ❌ Error: "authentication failed for user postgres"

**Solución**: Actualizar contraseña en `00_db.js` (línea 25):

```javascript
fase3: {
  password: 'root',  // ← Cambiar esto por TU contraseña de PostgreSQL
}
```

### ❌ Error: "connection refused"

**Solución**: Iniciar PostgreSQL:

```bash
net start postgresql-x64-17
```

### ❌ Error: "relation already exists"

**Esto está bien** - significa que el script ya se ejecutó exitosamente. Puedes:

- Ignorarlo (seguro)
- O volver a ejecutar con sentencias DROP primero

---

## ✅ Verificación

Después de que los scripts completen, verificar en psql:

```sql
-- Conectarse a la base de datos
psql -U postgres -d chamana_db_fase3

-- Verificar que todo fue creado
SELECT
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%') as indexes,
  (SELECT COUNT(*) FROM pg_matviews WHERE schemaname = 'public') as mat_views,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'usuarios') as auth_tables,
  (SELECT COUNT(*) FROM information_schema.views WHERE table_name LIKE 'vista_%') as views;
```

**Esperado**:

- indexes: 23+
- mat_views: 4
- auth_tables: 1 (usuarios existe)
- views: 10+

---

## 📋 Lo que se Creó

- ✅ **23 índices** para rendimiento
- ✅ **5 vistas optimizadas** (mejores JOINs)
- ✅ **4 vistas materializadas** (pre-calculadas)
- ✅ **5 tablas de autenticación** (usuarios, roles, permisos, etc.)
- ✅ **5 nuevas vistas BI** (categoría, temporada, tendencias, etc.)

**Total**: 37 objetos de base de datos agregados a la base de datos de Fase 3.

---

## 🎯 Próximos Pasos

Después de que la migración complete:

1. ✅ Migración de base de datos completada
2. ⏭️ Ir a la carpeta `4.final/web-nextjs/`
3. ⏭️ Ejecutar `npm install chart.js react-chartjs-2 react-csv`
4. ⏭️ Ejecutar `npm run dev`
5. ⏭️ Seguir [DEVELOPMENT_CHECKLIST.md](../DEVELOPMENT_CHECKLIST.md)

---

**¡Todo listo!** Tu base de datos ahora está optimizada para Fase 4.
