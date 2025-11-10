# 🚀 Guía de Deployment a Vercel

## Requisitos Previos

1. **Cuenta de Vercel**: [https://vercel.com/signup](https://vercel.com/signup)
2. **Base de Datos PostgreSQL en la nube** (elige una):
   - [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (Recomendado, integración automática)
   - [Supabase](https://supabase.com/) (Gratis hasta 500MB)
   - [Neon](https://neon.tech/) (Serverless PostgreSQL)
   - [Railway](https://railway.app/) (PostgreSQL + Hosting)

---

## 📋 Checklist Pre-Deployment

### 1. Base de Datos

- [ ] Crear base de datos PostgreSQL en la nube
- [ ] Ejecutar scripts de migración en la base de datos:
  ```bash
  # Conectarse a la BD en la nube y ejecutar:
  cd 4.final/database/scripts
  node 00_db.js  # Schema completo Fase 3
  ```
- [ ] Obtener string de conexión (formato: `postgresql://user:password@host:port/database`)

### 2. Variables de Entorno

- [ ] Copiar `.env.example` y configurar valores de producción
- [ ] Generar secrets seguros:
  ```bash
  # Generar AUTH_SECRET
  openssl rand -base64 32

  # Generar JWT_SECRET
  openssl rand -base64 32
  ```

### 3. Código

- [ ] Commit final al repositorio
- [ ] Push a GitHub/GitLab
- [ ] Verificar que `.vercelignore` excluye archivos innecesarios

---

## 🚀 Deployment a Vercel

### Opción 1: Deploy desde Vercel Dashboard (Recomendado)

1. **Conectar Repositorio**
   - Ve a [vercel.com/new](https://vercel.com/new)
   - Selecciona tu repositorio GitHub
   - Selecciona el proyecto `chamana`

2. **Configurar Root Directory**
   - **Root Directory**: `4.final/web-nextjs`
   - Framework Preset: `Next.js` (detectado automáticamente)
   - Build Command: `npm run build` (por defecto)
   - Output Directory: `.next` (por defecto)

3. **Configurar Variables de Entorno**

   En la sección "Environment Variables", agregar:

   ```
   # Database (REQUERIDO)
   DB_USER=tu_usuario_postgres
   DB_PASSWORD=tu_password_postgres
   DB_HOST=tu_host_postgres.com
   DB_PORT=5432
   DB_DATABASE=chamana_db_fase3

   # Application
   NEXT_PUBLIC_APP_NAME=CHAMANA E-commerce
   NEXT_PUBLIC_API_URL=https://tu-app.vercel.app

   # Authentication (REQUERIDO)
   AUTH_SECRET=tu_secret_generado_con_openssl
   AUTH_URL=https://tu-app.vercel.app

   # JWT
   JWT_SECRET=tu_jwt_secret_generado_con_openssl
   JWT_EXPIRES_IN=7d

   # Environment
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Deploy"
   - Esperar ~2-3 minutos
   - ¡Tu app estará en `https://tu-proyecto.vercel.app`!

### Opción 2: Deploy desde CLI

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Navegar al proyecto
cd 4.final/web-nextjs

# 4. Deploy (primera vez)
vercel

# 5. Configurar variables de entorno (interactivo)
vercel env add DB_USER
vercel env add DB_PASSWORD
vercel env add DB_HOST
vercel env add DB_PORT
vercel env add DB_DATABASE
vercel env add AUTH_SECRET
vercel env add AUTH_URL
vercel env add JWT_SECRET

# 6. Deploy a producción
vercel --prod
```

---

## 🗃️ Setup de Base de Datos en la Nube

### Opción A: Vercel Postgres (Más Fácil)

```bash
# 1. En Vercel Dashboard
- Ve a tu proyecto
- Pestaña "Storage"
- Click "Create Database"
- Seleccionar "Postgres"
- Crear base de datos

# 2. Copiar variables de entorno (automáticas)
POSTGRES_URL="..."
POSTGRES_PRISMA_URL="..."
POSTGRES_URL_NON_POOLING="..."

# 3. Ejecutar migraciones
# Conectarse vía psql o GUI y ejecutar scripts
```

### Opción B: Supabase (Gratis)

```bash
# 1. Crear proyecto en supabase.com
# 2. Ir a Settings > Database
# 3. Copiar "Connection string"
# 4. Usar en DB_HOST, DB_USER, DB_PASSWORD, etc.
# 5. Ejecutar scripts de migración desde Supabase SQL Editor
```

### Opción C: Neon (Serverless)

```bash
# 1. Crear proyecto en neon.tech
# 2. Copiar connection string
# 3. Parsear y agregar a env vars de Vercel
```

---

## 🔧 Configuración Post-Deployment

### 1. Verificar que la App Funciona

```bash
# Probar endpoints clave
curl https://tu-app.vercel.app/api/test-db
curl https://tu-app.vercel.app/api/products
curl https://tu-app.vercel.app/api/views/top-productos
```

### 2. Configurar Dominio Personalizado (Opcional)

1. En Vercel Dashboard > Settings > Domains
2. Agregar dominio: `chamana.tudominio.com`
3. Configurar DNS según instrucciones

### 3. Monitoreo

- **Logs**: Vercel Dashboard > Deployments > Logs
- **Analytics**: Vercel Dashboard > Analytics
- **Performance**: Vercel Speed Insights (opcional)

---

## 🚨 Troubleshooting

### Error: "Database connection failed"

**Causa**: Variables de entorno incorrectas o base de datos no accesible desde Vercel

**Solución**:
```bash
# 1. Verificar variables en Vercel Dashboard > Settings > Environment Variables
# 2. Verificar que DB permite conexiones externas (whitelist 0.0.0.0/0)
# 3. Probar conexión manualmente
psql "postgresql://user:pass@host:port/db"
```

### Error: "Module not found"

**Causa**: Dependencias no instaladas correctamente

**Solución**:
```bash
# Limpiar cache de build en Vercel Dashboard
# Settings > General > Clear Cache and Deploy
```

### Error: "Build failed"

**Causa**: TypeScript errors o ESLint errors

**Solución**:
```bash
# Verificar localmente primero
npm run build
npm run typecheck
npm run lint
```

### Error: "API route timeout"

**Causa**: Query de base de datos muy lenta (> 10 segundos)

**Solución**:
- Optimizar query
- Usar vistas materializadas
- Aumentar timeout en `vercel.json`:
  ```json
  {
    "functions": {
      "app/api/**/*.ts": {
        "maxDuration": 30
      }
    }
  }
  ```

---

## 📊 Performance Tips

### 1. Usar Vistas Materializadas

Las vistas materializadas son **MUY importantes** para Vercel porque reducen tiempo de respuesta:

```sql
-- En tu base de datos, crear vistas materializadas
-- Ver: 4.final/database/scripts/13_materialized_views.js
```

### 2. Índices

Asegúrate de que todos los índices estén creados:

```bash
# Ejecutar en tu base de datos en la nube
node 4.final/database/scripts/11_add_indexes.js
```

### 3. Caching

Vercel cachea automáticamente rutas estáticas. Para API routes:

```typescript
// app/api/products/route.ts
export const revalidate = 60; // Revalidar cada 60 segundos
```

---

## 🎓 Para Demo al Profesor

### 1. URL de Demo

Tu app estará en: `https://chamana-[tu-username].vercel.app`

Puedes compartir esta URL directamente con el profesor.

### 2. Páginas Importantes para Mostrar

- **Landing**: `https://tu-app.vercel.app/`
- **Dashboard**: `https://tu-app.vercel.app/dashboard`
- **API Productos**: `https://tu-app.vercel.app/api/products`
- **Vista Top Productos**: `https://tu-app.vercel.app/api/views/top-productos`

### 3. Presentación

```
Profesor, aquí está mi proyecto desplegado en producción:

🌐 URL: https://chamana-[username].vercel.app

📊 Features Demostrados:
- Base de datos PostgreSQL 3NF en la nube
- 5 vistas de Business Intelligence
- 3 procedimientos almacenados
- API REST completa
- Dashboard interactivo con charts
- Arquitectura DDD moderna

🔧 Stack:
- Next.js 14 + TypeScript
- PostgreSQL 14 (3NF)
- Vercel (Serverless)
- 92.5% test coverage

📖 Documentación: [Link a tu wiki]
🔗 Repositorio: [Link a tu GitHub]
```

---

## 📝 Notas Importantes

### Limitaciones de Vercel Free Tier

- ✅ **Build time**: 45 minutos/mes (suficiente)
- ✅ **Bandwidth**: 100GB/mes (suficiente para demo)
- ✅ **Function duration**: 10 segundos (ajustar si necesario)
- ⚠️ **Serverless Functions**: 12 por deployment (probablemente OK)

### Base de Datos

- **NO usar localhost** - Vercel no puede conectarse a tu PC
- **Usar servicio en la nube** - Supabase/Neon/Railway/Vercel Postgres
- **Connection pooling** - Usar para mejor performance

### Seguridad

- ✅ **Secrets** en variables de entorno de Vercel (no en código)
- ✅ **HTTPS** automático con Vercel
- ✅ **CORS** configurado en `vercel.json`

---

## ✅ Checklist Final

Antes de mostrar al profesor:

- [ ] App desplegada y accesible públicamente
- [ ] Base de datos con datos de ejemplo
- [ ] Todas las vistas funcionando
- [ ] API endpoints respondiendo correctamente
- [ ] Dashboard mostrando charts
- [ ] Sin errores en consola del navegador
- [ ] URL fácil de recordar/compartir
- [ ] README.md actualizado con URL de demo

---

**¡Listo para Deploy!** 🚀

Cualquier problema, revisa los logs en Vercel Dashboard o consulta la [documentación oficial](https://vercel.com/docs).
