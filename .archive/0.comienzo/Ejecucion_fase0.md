Ejecutando los scripts de la fase 0:

# node 01_crear_database.js

# 🗄️ CHAMANA - Creación de Base de Datos

⚠️ La base de datos "chamana_db_fase0" ya existe.
📌 Eliminando base de datos existente...

✅ Base de datos eliminada correctamente.

📌 Creando nueva base de datos "chamana_db_fase0"...
✅ Base de datos "chamana_db_fase0" creada exitosamente!

=====================================================
✨ Siguiente paso: Ejecutar "node 02_crear_tablas.js"
=====================================================

# node 02_crear_tablas.js

# 📋 CHAMANA - Creación de Tablas (Fase 0)

📌 Creando tabla "clientes" (simplificada)...
✅ Tabla "clientes" creada (7 columnas - solo comunicación)

📌 Creando tabla "categorias"...
✅ Tabla "categorias" creada

📌 Creando tabla "prendas" (pre-normalizada)...
✅ Tabla "prendas" creada (estructura pre-normalizada)

📌 Creando índices...
✅ Índices creados

=====================================================
✨ Tablas creadas exitosamente!

- clientes (7 columnas - simplificada)
- categorias (4 columnas)
- # prendas (10 columnas - pre-normalizada)
  # ✨ Siguiente paso: Ejecutar "node 03_insertar_categorias.js"

# node 03_insertar_categorias.js

# 📁 CHAMANA - Inserción de Categorías

📌 Insertando 5 categorías reales de CHAMANA...

✅ Categoría insertada: "Buzo" (ID: 1)
✅ Categoría insertada: "Remera" (ID: 2)
✅ Categoría insertada: "Vestido" (ID: 3)
✅ Categoría insertada: "Palazzo" (ID: 4)
✅ Categoría insertada: "Pantalón" (ID: 5)

📊 Resumen de categorías:

1.  Buzo
2.  Remera
3.  Vestido
4.  Palazzo
5.  Pantalón

=====================================================
✨ Categorías insertadas exitosamente!
Total: 5 categorías
=====================================================
✨ Siguiente paso: Ejecutar "node 04_insertar_prendas_real.js"
=====================================================

# node 04_insertar_prendas_real.js

# 👗 CHAMANA - Inserción de Prendas Reales

📌 Insertando 30 prendas del catálogo real...

✅ 10 prendas insertadas...
✅ 20 prendas insertadas...
✅ 30 prendas insertadas...

✅ Proceso completado: 30 prendas insertadas

📊 Resumen por categoría:
Buzo: 12 productos, Stock total: 18, Precio promedio: $42500.00
Remera: 5 productos, Stock total: 9, Precio promedio: $10000.00
Vestido: 1 productos, Stock total: 1, Precio promedio: $27000.00
Palazzo: 8 productos, Stock total: 10, Precio promedio: $33750.00
Pantalón: 4 productos, Stock total: 7, Precio promedio: $40000.00

TOTAL: 30 prendas en catálogo

=====================================================
✨ Prendas reales insertadas exitosamente!
Catálogo CHAMANA cargado con datos reales
=====================================================
✨ Siguiente paso: Ejecutar "node 05_insertar_clientes.js"
=====================================================

# node 05_insertar_clientes.js

# 👥 CHAMANA - Inserción de Clientes Ficticios

📌 Insertando 20 clientes ficticios...

✅ Cliente insertado: María García López (ID: 1)
✅ Cliente insertado: Ana Martínez Rodríguez (ID: 2)
✅ Cliente insertado: Sofía Hernández Pérez (ID: 3)
✅ Cliente insertado: Isabella González Sánchez (ID: 4)
✅ Cliente insertado: Valentina López Ramírez (ID: 5)
✅ Cliente insertado: Camila Rodríguez Torres (ID: 6)
✅ Cliente insertado: Lucía Pérez Flores (ID: 7)
✅ Cliente insertado: Daniela Sánchez Rivera (ID: 8)
✅ Cliente insertado: Victoria Ramírez Cruz (ID: 9)
✅ Cliente insertado: Martina Torres Morales (ID: 10)
✅ Cliente insertado: Emma Flores Gutiérrez (ID: 11)
✅ Cliente insertado: Mía Rivera Díaz (ID: 12)
✅ Cliente insertado: Renata Cruz Mendoza (ID: 13)
✅ Cliente insertado: Valeria Morales Castro (ID: 14)
✅ Cliente insertado: Natalia Gutiérrez Ortiz (ID: 15)
✅ Cliente insertado: Elena Díaz Vargas (ID: 16)
✅ Cliente insertado: Paula Mendoza Reyes (ID: 17)
✅ Cliente insertado: Fernanda Castro Romero (ID: 18)
✅ Cliente insertado: Gabriela Ortiz Silva (ID: 19)
✅ Cliente insertado: Carolina Vargas Herrera (ID: 20)

✅ 20 clientes insertados correctamente

📋 Muestra de clientes registrados:

1.  María García López | maria.garcia@email.com | 555-0101
2.  Ana Martínez Rodríguez | ana.martinez@email.com | 555-0102
3.  Sofía Hernández Pérez | sofia.hernandez@email.com | 555-0103
4.  Isabella González Sánchez | isabella.gonzalez@email.com | 555-0104
5.  Valentina López Ramírez | valentina.lopez@email.com | 555-0105

... y 15 más
TOTAL: 20 clientes

=====================================================
✨ Clientes ficticios insertados exitosamente!
20 clientes disponibles para pruebas
=====================================================
✨ Siguiente paso: Ejecutar "node 06_listar_todo.js"
=====================================================

# node 06_listar_todo.js

# 📊 CHAMANA - Verificación de Datos

📁 CATEGORÍAS:
─────────────────────────────────────────────────────

1. Buzo
   Buzos de algodón y mezclas cómodas para uso diario. Incluye diseños Gaia, Nube y Tormenta.
   Estado: ✅ Activa

2. Remera
   Remeras frescas y versátiles. Diseños Rocio, Brisa y otros en diferentes telas.
   Estado: ✅ Activa

3. Vestido
   Vestidos elegantes y casuales para toda ocasión. Diseño Aire y más.
   Estado: ✅ Activa

4. Palazzo
   Pantalones palazzo amplios y cómodos. Diseño Corteza en diferentes telas.
   Estado: ✅ Activa

5. Pantalón
   Pantalones clásicos y modernos. Diseño Raiz en diversos estilos.
   Estado: ✅ Activa

👗 PRENDAS (Muestra de 10):
─────────────────────────────────────────────────────

1. Gaia - Jersey Bordó
   Tipo: Buzo | Categoría: Buzo
   Tela: Jersey Bordó
   Precio CHAMANA: $40000.00
   Precio Arro: $34000.00 (-18% desc)
   Stock: 1 unidades

2. Gaia - Plush Verde
   Tipo: Buzo | Categoría: Buzo
   Tela: Plush Verde
   Precio CHAMANA: $40000.00
   Precio Arro: $34000.00 (-18% desc)
   Stock: 1 unidades

3. Gaia - Jersey Verde Musgo
   Tipo: Buzo | Categoría: Buzo
   Tela: Jersey Verde Musgo
   Precio CHAMANA: $40000.00
   Precio Arro: $34000.00 (-18% desc)
   Stock: 1 unidades

4. Gaia - Coral Negro
   Tipo: Buzo | Categoría: Buzo
   Tela: Coral Negro
   Precio CHAMANA: $50000.00
   Precio Arro: $42500.00 (-18% desc)
   Stock: 1 unidades

5. Nube - Frisa Verde
   Tipo: Buzo | Categoría: Buzo
   Tela: Frisa Verde
   Precio CHAMANA: $40000.00
   Precio Arro: $34000.00 (-18% desc)
   Stock: 1 unidades

6. Nube - Jersey Bordó
   Tipo: Buzo | Categoría: Buzo
   Tela: Jersey Bordó
   Precio CHAMANA: $40000.00
   Precio Arro: $34000.00 (-18% desc)
   Stock: 1 unidades

7. Nube - Coral Negro
   Tipo: Buzo | Categoría: Buzo
   Tela: Coral Negro
   Precio CHAMANA: $50000.00
   Precio Arro: $42500.00 (-18% desc)
   Stock: 1 unidades

8. Nube - Jersey Verde Agua
   Tipo: Buzo | Categoría: Buzo
   Tela: Jersey Verde Agua
   Precio CHAMANA: $40000.00
   Precio Arro: $34000.00 (-18% desc)
   Stock: 3 unidades

9. Nube - Jersey Verde Musgo
   Tipo: Buzo | Categoría: Buzo
   Tela: Jersey Verde Musgo
   Precio CHAMANA: $40000.00
   Precio Arro: $34000.00 (-18% desc)
   Stock: 4 unidades

10. Nube - Frisa Negro
    Tipo: Buzo | Categoría: Buzo
    Tela: Frisa Negro
    Precio CHAMANA: $40000.00
    Precio Arro: $34000.00 (-18% desc)
    Stock: 2 unidades

👥 CLIENTES (Muestra de 10):
─────────────────────────────────────────────────────

1. María García López ✅
   Email: maria.garcia@email.com
   Teléfono: 555-0101
   Registro: 20/10/2025 16:29

2. Ana Martínez Rodríguez ✅
   Email: ana.martinez@email.com
   Teléfono: 555-0102
   Registro: 20/10/2025 16:29

3. Sofía Hernández Pérez ✅
   Email: sofia.hernandez@email.com
   Teléfono: 555-0103
   Registro: 20/10/2025 16:29

4. Isabella González Sánchez ✅
   Email: isabella.gonzalez@email.com
   Teléfono: 555-0104
   Registro: 20/10/2025 16:29

5. Valentina López Ramírez ✅
   Email: valentina.lopez@email.com
   Teléfono: 555-0105
   Registro: 20/10/2025 16:29

6. Camila Rodríguez Torres ✅
   Email: camila.rodriguez@email.com
   Teléfono: 555-0106
   Registro: 20/10/2025 16:29

7. Lucía Pérez Flores ✅
   Email: lucia.perez@email.com
   Teléfono: 555-0107
   Registro: 20/10/2025 16:29

8. Daniela Sánchez Rivera ✅
   Email: daniela.sanchez@email.com
   Teléfono: 555-0108
   Registro: 20/10/2025 16:29

9. Victoria Ramírez Cruz ✅
   Email: victoria.ramirez@email.com
   Teléfono: 555-0109
   Registro: 20/10/2025 16:29

10. Martina Torres Morales ✅
    Email: martina.torres@email.com
    Teléfono: 555-0110
    Registro: 20/10/2025 16:29

📊 ESTADÍSTICAS GENERALES:
─────────────────────────────────────────────────────
📁 Categorías: 5
👗 Prendas: 30
👥 Clientes: 20

📦 Stock total: 45 unidades
💰 Precio promedio: $33900.00
💵 Precio mínimo: $10000.00
💎 Precio máximo: $50000.00

📊 Distribución por categoría:
Buzo: 12 productos (18 unidades)
Palazzo: 8 productos (10 unidades)
Remera: 5 productos (9 unidades)
Pantalón: 4 productos (7 unidades)
Vestido: 1 productos (1 unidades)

=====================================================
✨ Base de datos CHAMANA configurada exitosamente!
=====================================================
📌 Próximos pasos:

1.  Conectar con pgAdmin para explorar visualmente
2.  Iniciar servidor web: cd ../../web && npm install && npm run dev
3.  # Crear diagramas MER/DER (Mermaid)
