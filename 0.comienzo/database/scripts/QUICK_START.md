# Quick Start - CHAMANA Database Setup

**For**: First-time execution  
**Time**: 15-20 minutes  
**Language**: Commands in English, output in Spanish

---

## Step 1: Setup (5 min)

```powershell
# Navigate to scripts directory
cd C:\Users\PC\code\universidad\gabriel-db-final\0.comienzo\database\scripts

# Install dependencies
npm install

# Edit 00_db.js and change password
# Line 13: password: 'password',  <-- CHANGE THIS
```

---

## Step 2: Execute Scripts (10 min)

**Copy and paste these commands one by one:**

```powershell
# 1. Create database
node 01_crear_database.js

# 2. Create tables
node 02_crear_tablas.js

# 3. Insert categories
node 03_insertar_categorias.js

# 4. Insert products (31 real CHAMANA items)
node 04_insertar_prendas_real.js

# 5. Insert clients (20 fictitious)
node 05_insertar_clientes.js

# 6. Verify everything
node 06_listar_todo.js
```

---

## Step 3: Verify in pgAdmin (5 min)

1. Open pgAdmin 4
2. Refresh Databases
3. Find `chamana_db_fase0`
4. Expand: Schemas → public → Tables
5. Right-click any table → View/Edit Data → All Rows

---

## Expected Results

After script 06, you should see:

```
📁 Categorías: 5
👗 Prendas: 31
👥 Clientes: 20

📦 Stock total: 44 unidades
💰 Precio promedio: $30,645.16
```

---

## If Something Goes Wrong

**Start over**:

```powershell
node 01_crear_database.js
```

(This drops and recreates everything)

**See detailed help**:

```powershell
# Read the full guide
notepad README_EJECUCION.md
```

---

## Next Steps

1. Open pgAdmin and explore the data
2. Create MER/DER diagrams
3. Start web server: `cd ../../web && npm install && npm run dev`

---

**Ready? Start with Step 1!** 🚀
