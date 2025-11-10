# Inicio Rápido - Configuración de Base de Datos CHAMANA

**Para**: Primera ejecución  
**Tiempo**: 15-20 minutos  
**Idioma**: Comandos en español, salida en español

---

## Paso 1: Configuración (5 min)

```powershell
# Navegar al directorio de scripts
cd C:\Users\PC\code\universidad\gabriel-db-final\0.comienzo\database\scripts

# Instalar dependencias
npm install

# Editar 00_db.js y cambiar contraseña
# Línea 13: password: 'password',  <-- CAMBIAR ESTO
```

---

## Paso 2: Ejecutar Scripts (10 min)

**Copiar y pegar estos comandos uno por uno:**

```powershell
# 1. Crear base de datos
node 01_crear_database.js

# 2. Crear tablas
node 02_crear_tablas.js

# 3. Insertar categorías
node 03_insertar_categorias.js

# 4. Insertar productos (31 items reales de CHAMANA)
node 04_insertar_prendas_real.js

# 5. Insertar clientes (20 ficticios)
node 05_insertar_clientes.js

# 6. Verificar todo
node 06_listar_todo.js
```

---

## Paso 3: Verificar en pgAdmin (5 min)

1. Abrir pgAdmin 4
2. Actualizar Bases de Datos
3. Buscar `chamana_db_fase0`
4. Expandir: Schemas → public → Tables
5. Clic derecho en cualquier tabla → View/Edit Data → All Rows

---

## Resultados Esperados

Después del script 06, deberías ver:

```
📁 Categorías: 5
👗 Prendas: 31
👥 Clientes: 20

📦 Stock total: 44 unidades
💰 Precio promedio: $30,645.16
```

---

## Si Algo Sale Mal

**Empezar de nuevo**:

```powershell
node 01_crear_database.js
```

(Esto elimina y recrea todo)

**Ver ayuda detallada**:

```powershell
# Leer la guía completa
notepad README_EJECUCION.md
```

---

## Próximos Pasos

1. Abrir pgAdmin y explorar los datos
2. Crear diagramas MER/DER
3. Iniciar servidor web: `cd ../../web && npm install && npm run dev`

---

**¿Listo? ¡Comienza con el Paso 1!** 🚀
