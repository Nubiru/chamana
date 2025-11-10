# CHAMANA - Sistema de Gestión para Artesanas

**Plataforma E-commerce B2C/B2B para Moda Artesanal Femenina**

---

## 📋 Índice

- [Arquitectura del Sistema](./Arquitectura)
- [API Documentation](./API-Documentation)
- [Guía de Autenticación](./Autenticacion)
- [Migración de Base de Datos](./Migracion-Base-Datos)

---

## 🎯 Descripción del Proyecto

CHAMANA es una plataforma e-commerce diseñada para conectar artesanas peruanas con clientes B2C y mayoristas B2B.

### Características Principales

- Portal B2C y B2B
- Gestión de Inventario
- Procesamiento de Pedidos
- Sistema de Comisiones
- Reportes y Analíticas

### Tecnologías

- Frontend: Next.js 14
- Backend: Node.js API Routes
- Base de Datos: PostgreSQL (3NF)
- Autenticación: NextAuth.js
- Testing: Jest

---

## 🚀 Inicio Rápido

### Instalación

```bash
cd 4.final/web-nextjs
npm install
cp .env.example .env.local
npm run dev
```

### Base de Datos

```bash
cd database/scripts
npm install
node 00_db.js
```
