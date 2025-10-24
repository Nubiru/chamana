node 01_crear_database.js
🔨 Creando base de datos chamana_db_fase1...

✅ Base de datos chamana_db_fase1 creada exitosamente!

📍 Siguiente paso: Ejecuta 02_crear_tablas.js

PS C:\Users\PC\code\universidad\gabriel-db-final\1.normalizacion\database\scripts> node 02_crear_tablas.js
🔨 Creando tablas en chamana_db_fase1...

📋 Creando tabla: clientes
📋 Creando tabla: categorias
📋 Creando tabla: disenos
📋 Creando tabla: telas
📋 Creando tabla: años
📋 Creando tabla: temporadas
📋 Creando tabla: colecciones
📋 Creando tabla: prendas

✅ Todas las tablas creadas exitosamente!
📊 Total: 7 tablas (clientes, categorias, disenos, telas, años, temporadas, colecciones, prendas)

📍 Siguiente paso: Ejecuta 03_insertar_estaticos.js

PS C:\Users\PC\code\universidad\gabriel-db-final\1.normalizacion\database\scripts> node 03_insertar_estaticos.js
📥 Insertando datos estáticos en chamana_db_fase1...

📅 Insertando años (2022-2032)...
✅ 11 años insertados
🌞 Insertando temporadas...
✅ 2 temporadas insertadas
📦 Generando colecciones...
✅ 22 colecciones generadas

📊 Verificando datos insertados:

- Años: 11
- Temporadas: 2
- Colecciones: 22

✅ Datos estáticos insertados exitosamente!

📍 Siguiente paso: Ejecuta 04_migrar_clientes_categorias.js

PS C:\Users\PC\code\universidad\gabriel-db-final\1.normalizacion\database\scripts> node 04_migrar_clientes_categorias.js
🚚 Migrando clientes y categorías desde chamana_db_fase0...

👥 Migrando clientes...
✅ 20 clientes migrados
📂 Migrando categorías...
✅ 5 categorías migradas

📊 Verificando migración:

- Clientes: 20
- Categorías: 5

✅ Clientes y categorías migrados exitosamente!

📍 Siguiente paso: Ejecuta 05_extraer_disenos_telas.js

PS C:\Users\PC\code\universidad\gabriel-db-final\1.normalizacion\database\scripts> node 05_extraer_disenos_telas.js
🔍 Extrayendo diseños y telas desde chamana_db_fase0...

❌ Error al extraer diseños y telas: column "tipo_prenda" does not exist
C:\Users\PC\code\universidad\gabriel-db-final\1.normalizacion\database\scripts\node_modules\pg-pool\index.js:45
Error.captureStackTrace(err)
^

error: column "tipo_prenda" does not exist
at C:\Users\PC\code\universidad\gabriel-db-final\1.normalizacion\database\scripts\node_modules\pg-pool\index.js:45:11
at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
at async extraerDisenosTelas (C:\Users\PC\code\universidad\gabriel-db-final\1.normalizacion\database\scripts\05_extraer_disenos_telas.js:14:27) {
length: 111,
severity: 'ERROR',
code: '42703',
detail: undefined,
hint: undefined,
position: '25',
internalPosition: undefined,
internalQuery: undefined,
where: undefined,
schema: undefined,
table: undefined,
column: undefined,
dataType: undefined,
constraint: undefined,
file: 'parse_relation.c',
line: '3721',
routine: 'errorMissingColumn'
}
