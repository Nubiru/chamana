# Guía Rápida: Fase 1 - Primera Forma Normal (1NF)

## Proyecto: CHAMANA - E-commerce de Ropa Femenina

---

## 📋 Resumen

Esta fase implementa la **Primera Forma Normal (1NF)** expandiendo la base de datos de 3 a 7 tablas mediante la normalización de diseños, telas y la creación de una estructura de colecciones estacionales.

**Cambios principales:**
- ✅ Extracción de diseños a tabla separada
- ✅ Extracción de telas a tabla separada  
- ✅ Creación de sistema de colecciones estacionales (años + temporadas)
- ✅ Migración de datos desde Fase 0

---

## 🗂️ Estructura de Base de Datos

### Fase 0 (3 tablas)
```
clientes, prendas, categorias
```

### Fase 1 (7 tablas - 1NF)
```
clientes, categorias, disenos, telas, años, temporadas, colecciones, prendas
```

---

## 🚀 Ejecución Paso a Paso

### Requisitos Previos
1. PostgreSQL 17 instalado y corriendo
2. Base de datos `chamana_db_fase0` existente y poblada
3. Node.js instalado
4. Dependencia `pg` instalada (`npm install` en esta carpeta)

### Orden de Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Crear base de datos
node 01_crear_database.js

# 3. Crear 7 tablas con foreign keys
node 02_crear_tablas.js

# 4. Insertar datos estáticos (años, temporadas, colecciones)
node 03_insertar_estaticos.js

# 5. Migrar clientes y categorías desde Fase 0
node 04_migrar_clientes_categorias.js

# 6. Extraer diseños y telas desde Fase 0
node 05_extraer_disenos_telas.js

# 7. Migrar prendas con nuevas relaciones
node 06_migrar_prendas.js

# 8. Verificar integridad completa
node 07_verificar.js
```

---

## ⏱️ Tiempo Estimado

- **Total**: ~5-10 minutos
- Cada script toma entre 1-2 segundos

---

## ✅ Verificación de Éxito

Después de ejecutar `07_verificar.js`, deberías ver:

```
✅ VERIFICACIÓN COMPLETADA EXITOSAMENTE

📋 Resumen:
   - Base de datos en Primera Forma Normal (1NF)
   - 7 tablas normalizadas operativas
   - Todas las foreign keys validadas
   - JOINs funcionando correctamente
   - Datos migrados desde Fase 0
```

---

## 📊 Datos Esperados

| Tabla         | Registros Aprox. |
|---------------|------------------|
| clientes      | 20               |
| categorias    | 3                |
| disenos       | ~15              |
| telas         | ~10              |
| años          | 11 (2022-2032)   |
| temporadas    | 2                |
| colecciones   | 22               |
| prendas       | 31               |

---

## 🔧 Solución de Problemas

### Error: "Base de datos no existe"
- Asegúrate de haber ejecutado `01_crear_database.js` primero

### Error: "chamana_db_fase0 no existe"
- Verifica que completaste la Fase 0 correctamente
- Ejecuta los scripts de Fase 0 si es necesario

### Error: "No se encontraron colecciones de 2025"
- Ejecuta `03_insertar_estaticos.js` antes de `06_migrar_prendas.js`

### Error: "Contraseña incorrecta"
- Modifica `00_db.js` con tu contraseña de PostgreSQL

---

## 📚 Próximos Pasos

Después de completar esta fase:

1. ✅ Verifica en pgAdmin que las 7 tablas existen
2. ✅ Prueba algunos JOINs manualmente
3. ✅ Revisa la documentación en `../documentation/`
4. ✅ Inicia la aplicación web (si aplica)
5. 🎯 Prepárate para Fase 2 (Segunda Forma Normal - 2NF)

---

## 📞 Contacto

**Proyecto**: CHAMANA Database - Fase 1 (1NF)  
**Fecha**: 2025-10-20  
**Base de Datos**: chamana_db_fase1

