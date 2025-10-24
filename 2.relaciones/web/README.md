# CHAMANA E-commerce - Fase 2: Segunda Forma Normal (2NF)

**Versión**: 2.0.0  
**Fecha**: 23 de Octubre, 2025  
**Autor**: Gabriel Osemberg

---

## 📋 Resumen

Aplicación web para CHAMANA - E-commerce de Ropa Femenina utilizando arquitectura de producción con base de datos normalizada en Segunda Forma Normal (2NF).

### Características Principales

- ✅ **Blue-Green Deployment**: Cambio de versión de base de datos sin modificar código
- ✅ **Service Layer Pattern**: Lógica de negocio aislada de HTTP
- ✅ **Transaction Management**: Operaciones ACID con rollback automático
- ✅ **Error Handling**: Clases de error personalizadas
- ✅ **Structured Logging**: Logs en formato JSON
- ✅ **Input Validation**: Validadores reutilizables
- ✅ **Backwards Compatible**: Todas las funcionalidades de Fase 1 funcionan

---

## 🏗️ Arquitectura

### Arquitectura en Capas

```
┌─────────────────────────────────────────┐
│ PRESENTATION LAYER (Routes)             │
│ • HTTP concerns (request/response)      │
│ • Input validation                      │
│ • Response formatting                   │
└─────────────────────────────────────────┘
                ↓ calls
┌─────────────────────────────────────────┐
│ BUSINESS LOGIC LAYER (Services)         │
│ • Business rules                        │
│ • Transaction orchestration             │
│ • Data validation                       │
└─────────────────────────────────────────┘
                ↓ uses
┌─────────────────────────────────────────┐
│ DATA ACCESS LAYER (Database)            │
│ • SQL queries                           │
│ • Connection pooling                    │
│ • Transaction management                │
└─────────────────────────────────────────┘
```

### Estructura de Directorios

```
2.relaciones/web/
├── app.js                  # Aplicación Express principal
├── package.json            # Dependencias
├── config.env.example      # Template de variables de entorno
│
├── config/                 # Configuración
│   ├── database.js         # Blue-Green database config
│   ├── logger.js           # Structured logging
│   └── constants.js        # Constantes de la aplicación
│
├── middleware/             # Express middleware
│   ├── errorHandler.js     # Manejo centralizado de errores
│   └── requestLogger.js    # Logging de requests HTTP
│
├── services/               # Lógica de negocio
│   ├── base.service.js     # Servicio base con utilidades
│   └── transaction.service.js  # Manejo de transacciones
│
├── utils/                  # Utilidades
│   ├── errors.js           # Clases de error personalizadas
│   └── validation.js       # Validadores reutilizables
│
├── routes/                 # API endpoints
│   ├── categorias.js       # CRUD de categorías
│   ├── productos.js        # CRUD de productos
│   └── usuarios.js         # CRUD de usuarios/clientes
│
└── public/                 # Archivos estáticos
    ├── views/              # HTML templates
    ├── css/                # Estilos
    └── js/                 # JavaScript del cliente
```

---

## 🚀 Instalación y Uso

### Prerrequisitos

- **Node.js**: >=18.0.0
- **PostgreSQL**: 17
- **Bases de datos**:
  - `chamana_db_fase1` (Primera Forma Normal)
  - `chamana_db_fase2` (Segunda Forma Normal)

### Instalación

1. **Clonar el repositorio** (si no lo has hecho):

```bash
cd 2.relaciones/web
```

2. **Instalar dependencias**:

```bash
npm install
```

3. **Configurar variables de entorno**:

```bash
# Copiar template
cp config.env.example .env

# Editar .env con tus credenciales
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432
DB_VERSION=fase2  # o fase1 para usar Fase 1
PORT=3000
NODE_ENV=development
```

4. **Iniciar el servidor**:

```bash
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

### Blue-Green Deployment

Cambiar entre versiones de base de datos **sin modificar código**:

```bash
# Usar Fase 1 (1NF)
DB_VERSION=fase1 npm start

# Usar Fase 2 (2NF)
DB_VERSION=fase2 npm start
```

El servidor se conectará automáticamente a la base de datos correspondiente (`chamana_db_fase1` o `chamana_db_fase2`).

---

## 📡 API Endpoints

### Sistema

```
GET  /api/test            - Prueba de conexión
GET  /api/system/info     - Información del sistema
GET  /health              - Health check
```

### Categorías

```
GET    /api/categorias         - Listar todas las categorías
GET    /api/categorias/:id     - Obtener categoría por ID
POST   /api/categorias         - Crear nueva categoría
PUT    /api/categorias/:id     - Actualizar categoría
DELETE /api/categorias/:id     - Eliminar categoría
```

### Productos

```
GET    /api/productos          - Listar todos los productos
GET    /api/productos/:id      - Obtener producto por ID
POST   /api/productos          - Crear nuevo producto
PUT    /api/productos/:id      - Actualizar producto
DELETE /api/productos/:id      - Eliminar producto
```

### Usuarios/Clientes

```
GET    /api/usuarios           - Listar todos los usuarios
GET    /api/usuarios/:id       - Obtener usuario por ID
POST   /api/usuarios           - Crear nuevo usuario
PUT    /api/usuarios/:id       - Actualizar usuario
DELETE /api/usuarios/:id       - Eliminar usuario
```

---

## 🛠️ Características Técnicas

### Blue-Green Deployment

**¿Qué es?**

Estrategia de despliegue que permite cambiar entre versiones de base de datos sin modificar código. "Blue" y "Green" representan dos entornos (Fase 1 y Fase 2).

**Beneficios**:

- ✅ Cambio instantáneo entre versiones
- ✅ Zero downtime
- ✅ Rollback inmediato si algo falla
- ✅ Comparación A/B de rendimiento

**Implementación**:

```javascript
// config/database.js
const DB_VERSION = process.env.DB_VERSION || 'fase2';
const pool = new Pool(DB_CONFIGS[DB_VERSION]);
```

### Service Layer Pattern

**¿Qué es?**

Patrón de diseño que separa la lógica de negocio de las preocupaciones HTTP.

**Beneficios**:

- ✅ Lógica de negocio reutilizable
- ✅ Más fácil de testear (sin HTTP mocking)
- ✅ Rutas más limpias (solo HTTP concerns)
- ✅ Preparado para migración a NextJS/Prisma

**Ejemplo**:

```javascript
// ❌ ANTES: Lógica en ruta
router.post('/pedidos', async (req, res) => {
  // ... 100 líneas de lógica de negocio mezclada con HTTP
});

// ✅ AHORA: Lógica en servicio
router.post('/pedidos', async (req, res, next) => {
  try {
    const order = await pedidosService.createOrder(req.body);
    res.status(201).json(order);
  } catch (error) {
    next(error); // Manejado centralmente
  }
});
```

### Transaction Management

**¿Qué es?**

Todas las operaciones de escritura usan transacciones para garantizar ACID compliance.

**Beneficios**:

- ✅ Atomicidad (todo o nada)
- ✅ Rollback automático en errores
- ✅ Consistencia de datos garantizada
- ✅ Estado predecible siempre

**Uso**:

```javascript
const result = await this.executeInTransaction(async (client) => {
  // Todas estas operaciones son atómicas
  const order = await client.query('INSERT INTO pedidos ...');
  const items = await client.query('INSERT INTO pedidos_prendas ...');
  const stock = await client.query('UPDATE prendas SET stock ...');
  return { order, items, stock };
});
// Si alguna falla, TODAS se revierten automáticamente
```

### Error Handling

**Custom Error Classes**:

```javascript
throw new ValidationError('Email es requerido'); // → 400
throw new NotFoundError('Producto no encontrado'); // → 404
throw new DatabaseError('Error en query'); // → 500
throw new AuthenticationError('Token inválido'); // → 401
throw new AuthorizationError('Sin permisos'); // → 403
```

**Centralized Handler**:

Todos los errores son capturados y formateados consistentemente por `middleware/errorHandler.js`.

### Structured Logging

**Logs en formato JSON** para fácil parsing:

```json
{
  "level": "INFO",
  "timestamp": "2025-10-23T12:00:00.000Z",
  "message": "HTTP Request",
  "method": "GET",
  "url": "/api/productos",
  "status": 200,
  "duration": "45ms"
}
```

**Niveles de log**:

- `INFO`: Operaciones normales
- `WARN`: Advertencias (requests lentos >1000ms)
- `ERROR`: Errores con stack trace
- `DEBUG`: Debug detallado (solo desarrollo)

---

## 🔍 Comparación Fase 1 vs Fase 2

### Base de Datos

| Aspecto              | Fase 1 (1NF)                   | Fase 2 (2NF)                                     |
| -------------------- | ------------------------------ | ------------------------------------------------ |
| **Normalización**    | Primera Forma Normal           | Segunda Forma Normal                             |
| **Tablas**           | 9 tablas                       | 12 tablas                                        |
| **Nuevas Tablas**    | -                              | pedidos, pedidos_prendas, movimientos_inventario |
| **Dependencias**     | Algunas dependencias parciales | Eliminadas todas las dependencias parciales      |
| **Redundancia**      | Presente en algunos atributos  | Minimizada                                       |
| **Stock Management** | No implementado                | Completo (inicial, vendido, disponible)          |
| **Pedidos**          | No implementados               | Completos con estados y tracking                 |

### Código

| Aspecto             | Fase 1                   | Fase 2                             |
| ------------------- | ------------------------ | ---------------------------------- |
| **Arquitectura**    | Simple (routes directas) | Capas (routes → services → data)   |
| **Transacciones**   | Manuales                 | Automáticas con BaseService        |
| **Error Handling**  | Básico                   | Clases personalizadas + middleware |
| **Logging**         | Console.log simple       | Structured JSON logging            |
| **Validación**      | Ad-hoc en cada ruta      | Validadores reutilizables          |
| **Migration Ready** | No                       | Sí (preparado para NextJS/Prisma)  |

---

## 🎓 Para la Universidad

### Demostración de 2NF

**Eliminación de Dependencias Parciales**:

- **Fase 1**: Atributos dependían parcialmente de claves compuestas
- **Fase 2**: Todas las dependencias son de clave primaria completa

**Ejemplo**:

```sql
-- FASE 1 (1NF): Dependencia parcial
-- Si prenda_id + tela_id es clave, pero tela_nombre depende solo de tela_id

-- FASE 2 (2NF): Tablas separadas
CREATE TABLE telas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

CREATE TABLE prendas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  tela_id INT REFERENCES telas(id)  -- Clave foránea simple
);
```

### Beneficios Demostrados

1. **Menos Redundancia**: Datos no se repiten
2. **Actualización Más Fácil**: Cambiar en un solo lugar
3. **Integridad de Datos**: Foreign keys garantizan consistencia
4. **Escalabilidad**: Mejor rendimiento en queries complejas
5. **Mantenibilidad**: Código más limpio y organizado

---

## 📚 Recursos Adicionales

### Documentación del Proyecto

- `2.relaciones/documentation/MER_FASE2.md` - Modelo Entidad-Relación
- `2.relaciones/documentation/DER_FASE2.md` - Diagrama Entidad-Relación
- `2.relaciones/documentation/COMPARISON_FASE1_FASE2.md` - Comparación detallada

### Scripts de Base de Datos

- `2.relaciones/database/scripts/` - Scripts de creación y migración

---

## 🐛 Troubleshooting

### Error: "DB_VERSION inválido"

**Problema**: Variable de entorno DB_VERSION tiene valor incorrecto.

**Solución**:

```bash
# Valores válidos: fase1, fase2
DB_VERSION=fase2 npm start
```

### Error: "Error conectando a base de datos"

**Problema**: No puede conectar a PostgreSQL.

**Solución**:

1. Verificar que PostgreSQL está corriendo
2. Verificar credenciales en `.env`
3. Verificar que la base de datos existe:

```sql
-- En psql:
\l  -- Listar bases de datos
-- Debe aparecer chamana_db_fase1 y chamana_db_fase2
```

### Puerto 3000 ya en uso

**Problema**: Otro proceso usa el puerto 3000.

**Solución**:

```bash
# Cambiar puerto
PORT=3001 npm start

# O matar proceso en puerto 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 📞 Contacto

**Autor**: Gabriel Osemberg  
**Proyecto**: CHAMANA - E-commerce de Ropa Femenina  
**Universidad**: [Tu Universidad]  
**Fecha**: Octubre 2025

---

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.

---

**¡Feliz Coding! 🚀✨**
