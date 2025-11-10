# DER - Fase 3 (3NF)

**Autor**: Gabriel Osemberg
**Fecha**: Noviembre 2025

---

## Diagrama Entidad-Relación (Mermaid)

```mermaid
erDiagram
    clientes ||--o{ pedidos : "realiza"
    clientes ||--o{ direcciones : "tiene"
    pedidos ||--o{ pedidos_prendas : "contiene"
    pedidos }o--|| estados_pedido : "tiene estado"
    pedidos }o--|| metodos_pago : "pagado con"
    pedidos }o--o| direcciones : "envío a"
    pedidos ||--o{ historial_estados_pedido : "registra cambios"
    prendas ||--o{ pedidos_prendas : "incluida en"
    prendas }o--|| tipos_prenda : "es de tipo"
    prendas }o--|| años : "colección"
    prendas }o--|| telas : "material"
    prendas }o--|| patrones : "diseño"
    prendas }o--|| artesanos : "confeccionada por"
    prendas ||--o{ movimientos_inventario : "registra movimientos"
    telas ||--o{ telas_proveedores : "suministrada por"
    proveedores ||--o{ telas_proveedores : "suministra"

    clientes {
        int id PK
        varchar nombre
        varchar email UK
        varchar telefono
        boolean activo
        timestamp created_at
    }

    direcciones {
        int id PK
        int cliente_id FK
        varchar tipo
        varchar calle
        varchar ciudad
        varchar estado
        varchar codigo_postal
        varchar pais
        boolean predeterminada
    }

    pedidos {
        int id PK
        int cliente_id FK
        int estado_id FK
        int metodo_pago_id FK
        int direccion_envio_id FK
        decimal subtotal
        decimal descuento
        decimal total
        timestamp fecha_pedido
        timestamp fecha_completado
    }

    estados_pedido {
        int id PK
        varchar nombre UK
        text descripcion
        int orden_workflow
    }

    metodos_pago {
        int id PK
        varchar codigo UK
        varchar nombre
        varchar tipo
        decimal comision
        int orden
    }

    historial_estados_pedido {
        int id PK
        int pedido_id FK
        int estado_anterior_id FK
        int estado_nuevo_id FK
        timestamp fecha_cambio
        int usuario_id
    }

    pedidos_prendas {
        int id PK
        int pedido_id FK
        int prenda_id FK
        int cantidad
        decimal precio_unitario
        decimal subtotal
    }

    prendas {
        int id PK
        varchar nombre
        int tipo_prenda_id FK
        int año_id FK
        int tela_id FK
        int patron_id FK
        int artesano_id FK
        decimal precio_chamana
        int stock_inicial
        int stock_vendido
        boolean activa
        timestamp fecha_ultima_venta
    }

    tipos_prenda {
        int id PK
        varchar nombre UK
        text descripcion
        text cuidados
    }

    años {
        int id PK
        int año UK
        varchar temporada
    }

    telas {
        int id PK
        varchar nombre UK
        text descripcion
        varchar unidad
    }

    patrones {
        int id PK
        varchar nombre UK
        text descripcion
        varchar origen
    }

    artesanos {
        int id PK
        varchar nombre
        varchar especialidad
        varchar comunidad
    }

    proveedores {
        int id PK
        varchar nombre
        varchar contacto
        varchar telefono
    }

    telas_proveedores {
        int id PK
        int tela_id FK
        int proveedor_id FK
        decimal precio_proveedor
    }

    movimientos_inventario {
        int id PK
        int prenda_id FK
        varchar tipo
        int cantidad
        int stock_anterior
        int stock_nuevo
        int pedido_id FK
        text motivo
        timestamp fecha
    }
```

---

## Resumen

### Tablas: 19
1. clientes
2. direcciones ⭐ 3NF
3. pedidos
4. estados_pedido ⭐ 3NF
5. metodos_pago ⭐ 3NF
6. historial_estados_pedido ⭐ 3NF
7. pedidos_prendas
8. prendas
9. tipos_prenda ⭐ 3NF
10. años
11. telas
12. patrones
13. artesanos
14. proveedores ⭐ 3NF
15. telas_proveedores ⭐ 3NF
16. movimientos_inventario ⭐ 3NF

### Relaciones (Foreign Keys): 14

### Vistas (Business Intelligence): 5
1. vista_ventas_mensuales
2. vista_inventario_critico
3. vista_top_productos
4. vista_analisis_clientes
5. vista_rotacion_inventario

### Procedimientos Almacenados: 3
1. procesar_pedido()
2. reabastecer_inventario()
3. calcular_comision_vendedor()

### Triggers: 3
1. trigger_actualizar_stock_pedido
2. trigger_registrar_historial_estado
3. trigger_alertar_stock_critico

---

## Mejoras vs Fase 2

✅ **Eliminación de dependencias transitivas**:
- Direcciones separadas de clientes
- Estados de pedido normalizados
- Tipos de prenda centralizados
- Métodos de pago estandarizados

✅ **Auditoría completa**:
- historial_estados_pedido rastrea todos los cambios
- movimientos_inventario registra todas las operaciones

✅ **Business Intelligence**:
- 5 vistas optimizadas para análisis
- Datos pre-calculados para reportes

✅ **Lógica de negocio en base de datos**:
- Procedimientos almacenados encapsulan operaciones complejas
- Triggers automatizan validaciones

✅ **Escalabilidad**:
- Múltiples direcciones por cliente
- Múltiples proveedores por tela
- Historial ilimitado de estados

---

**Autor**: Gabriel Osemberg
**Proyecto**: CHAMANA - E-commerce de Ropa Femenina
**Fecha**: Noviembre 2025
