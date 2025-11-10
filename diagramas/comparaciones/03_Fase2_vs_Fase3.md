# Comparativa: Fase 2 (2NF) vs Fase 3 (3NF)

**Autor**: Gabriel Osemberg  
**Fecha**: Noviembre 2025

---

## Tabla de Comparación

| Criterio | Fase 2 (2NF) | Fase 3 (3NF) | Mejora |
|----------|--------------|--------------|--------|
| **Tablas** | 12 tablas | 19 tablas | +7 tablas |
| **Normalización** | Segunda Forma Normal | Tercera Forma Normal | ✅ Completa |
| **Redundancia** | Baja | Mínima | ✅ Eliminada |
| **Dependencias** | Solo directas | Sin transitivas | ✅ Perfecta |
| **Vistas** | 0 | 5 vistas BI | ✅ Analytics |
| **Procedures** | 0 | 3 procedures | ✅ Lógica en DB |
| **Triggers** | 0 | 3 triggers | ✅ Automatización |
| **Integridad** | Alta | Muy Alta | ✅ Mejorada |
| **Performance** | Buena | Optimizada | ✅ Índices |
| **Escalabilidad** | Limitada | Alta | ✅ Preparada |
| **Auditoría** | Básica | Completa | ✅ Historial |

---

## Evolución de Tablas

### Antes (Fase 2)

```
clientes
  ├── id
  ├── nombre
  ├── email
  ├── telefono
  ├── direccion       ❌ Dependencia transitiva!
  └── created_at

pedidos
  ├── id
  ├── cliente_id
  ├── estado          ❌ String sin historial!
  ├── total
  └── fecha_pedido

prendas
  ├── id
  ├── nombre
  ├── tipo            ❌ String redundante!
  ├── precio_chamana
  └── stock_inicial
```

### Después (Fase 3)

```
clientes
  ├── id
  ├── nombre
  ├── email
  ├── telefono        ✅ Solo datos del cliente
  └── created_at

direcciones ⭐ NUEVA
  ├── id
  ├── cliente_id      ✅ Relación 1:M
  ├── tipo            ✅ envio/facturacion/principal
  ├── direccion
  ├── ciudad
  ├── estado
  ├── codigo_postal
  ├── pais
  └── predeterminada

pedidos
  ├── id
  ├── cliente_id
  ├── estado_id       ✅ FK a estados_pedido
  ├── metodo_pago_id  ✅ FK a metodos_pago
  ├── total
  └── fecha_pedido

estados_pedido ⭐ NUEVA
  ├── id
  ├── nombre
  ├── descripcion
  └── orden_workflow

historial_estados_pedido ⭐ NUEVA
  ├── id
  ├── pedido_id
  ├── estado_anterior_id
  ├── estado_nuevo_id
  ├── fecha_cambio
  └── usuario_id

tipos_prenda ⭐ NUEVA
  ├── id
  ├── nombre
  ├── descripcion
  └── cuidados

prendas
  ├── id
  ├── nombre
  ├── tipo_prenda_id  ✅ FK a tipos_prenda
  ├── precio_chamana
  └── stock_inicial

proveedores ⭐ NUEVA
  ├── id
  ├── nombre
  ├── contacto
  └── telefono

telas_proveedores ⭐ NUEVA
  ├── id
  ├── tela_id
  ├── proveedor_id
  └── precio_proveedor

metodos_pago ⭐ NUEVA
  ├── id
  ├── nombre
  └── descripcion
```

---

## Diagrama Visual

### Fase 2 (2NF) - Dependencia Transitiva

```
┌─────────────┐
│  clientes   │
│             │──┐
│ direccion   │  │ ❌ Dependencia transitiva
│ (ciudad,    │  │    ciudad, región, CP dependen
│  region,    │  │    de dirección, no de cliente_id
│  CP)        │  │
└─────────────┘  │
                 ▼
         (Redundancia: misma ciudad
          repetida en múltiples clientes)
```

### Fase 3 (3NF) - Sin Dependencias Transitivas

```
┌─────────────┐         ┌─────────────────┐
│  clientes   │◄──────┐ │  direcciones    │
│             │       └─┤  cliente_id FK  │
│ (sin addr)  │         │  calle, ciudad  │
└─────────────┘         │  region, CP     │
                        │  predeterminada │
                        └─────────────────┘
                        ✅ Sin dependencias transitivas
                        ✅ Múltiples direcciones por cliente
```

---

## Ventajas de 3NF

### 1. Eliminación de Redundancia

**Antes (2NF)**:
```sql
clientes:
id | nombre | direccion
1  | Juan   | Av. Siempre Viva 742, Springfield, SP, 12345
2  | María  | Av. Siempre Viva 742, Springfield, SP, 12345
```
❌ "Springfield, SP, 12345" repetido

**Después (3NF)**:
```sql
clientes:
id | nombre
1  | Juan
2  | María

direcciones:
id | cliente_id | calle               | ciudad      | region | CP
1  | 1          | Av. Siempre Viva 742 | Springfield | SP     | 12345
2  | 2          | Av. Siempre Viva 742 | Springfield | SP     | 12345
```
✅ Datos normalizados, sin redundancia  
✅ Cambiar ciudad de Springfield = 1 UPDATE, no N

### 2. Mejor Integridad

**Antes**: Cambiar estado de pedido = UPDATE manual, sin historial  
**Después**: Trigger automático registra en `historial_estados_pedido`

### 3. Flexibilidad

**Antes**: 1 cliente = 1 dirección  
**Después**: 1 cliente = N direcciones (casa, trabajo, envío)

### 4. Auditoría

**Antes**: No hay historial de cambios  
**Después**: `historial_estados_pedido` rastrea todos los cambios

### 5. Escalabilidad

**Antes**: Agregar nuevo estado = modificar código  
**Después**: Agregar nuevo estado = INSERT en `estados_pedido`

---

## Impacto en Performance

### Consultas Simples

- **Fase 2**: 1 JOIN (clientes → pedidos)
- **Fase 3**: 2-3 JOINs (clientes → direcciones → pedidos)  
  **Pero**: Con índices optimizados, diferencia mínima

### Consultas Complejas

- **Fase 2**: SQL complejo con subconsultas, cálculos en tiempo real
- **Fase 3**: Vistas pre-optimizadas (mejor performance)

**Ejemplo**:
```sql
-- Fase 2: Query manual complejo
SELECT 
  TO_CHAR(fecha_pedido, 'YYYY-MM') as mes,
  COUNT(*) as pedidos,
  SUM(total) as ventas
FROM pedidos
GROUP BY TO_CHAR(fecha_pedido, 'YYYY-MM');

-- Fase 3: Vista pre-calculada
SELECT * FROM vista_ventas_mensuales;
```

### Inserts/Updates

- **Fase 2**: Más rápidos (menos tablas)
- **Fase 3**: Ligeramente más lentos, pero con triggers que aseguran integridad

**Conclusión**: Fase 3 sacrifica velocidad marginal por integridad y escalabilidad

---

## Casos de Uso Mejorados

### Caso 1: Cliente con Múltiples Direcciones

**Fase 2**: Imposible (solo 1 dirección)  
**Fase 3**: ✅ N direcciones, marcar predeterminada

### Caso 2: Historial de Cambios de Estado

**Fase 2**: No existe  
**Fase 3**: ✅ Trigger automático + tabla de historial

### Caso 3: Análisis de Ventas

**Fase 2**: Query manual complejo  
**Fase 3**: ✅ Vista `vista_ventas_mensuales` pre-calculada

### Caso 4: Alertas de Stock

**Fase 2**: Revisar manualmente  
**Fase 3**: ✅ Vista `vista_inventario_critico` + trigger de alerta

### Caso 5: Múltiples Proveedores por Tela

**Fase 2**: Imposible (1 precio por tela)  
**Fase 3**: ✅ Tabla `telas_proveedores` permite comparar precios

---

## Conclusión

| Aspecto | Ganador |
|---------|---------|
| Normalización | Fase 3 ✅ |
| Integridad | Fase 3 ✅ |
| Escalabilidad | Fase 3 ✅ |
| Flexibilidad | Fase 3 ✅ |
| Auditoría | Fase 3 ✅ |
| Business Intelligence | Fase 3 ✅ |
| Simplicidad | Fase 2 |
| Velocidad (simple) | Fase 2 |

**Veredicto**: Fase 3 es superior para aplicaciones de producción y análisis de datos.

---

**Autor**: Gabriel Osemberg  
**Fecha**: Noviembre 2025

