# User-Journey — F-Variante-metrosRequeridos-Modelo-estado / G-16

**Spec**: `.context/active/agents/sigma/we-expect/F-variante-metrosRequeridos-modelo-estado.md`
**Task**: G-16 (fields + migration + admin UX — FIELD half; state-machine hook is G-N+1)
**Audience**: Cintia. Phone-friendly. Run after Gabriel applies the migration
in production (or in dev after `pnpm payload migrate`).
**Out of scope for G-16**: state-transition validation (skip-EnProduccion-error
walkthrough). That lands with G-N+1 (modelos-state-machine hook) and gets a
sibling journey.

---

## Pre-condition

- Migration `20260521_030000_add_modelo_estado_variante_metros` applied. All
  ~14 existing modelos in the DB have `estado: 'nueva'` by default. All
  ~58 existing variantes have `metrosRequeridos: null`.
- Cintia is logged in at `/admin/login`.

---

## Step 1 — Cintia ve la nueva columna Estado en la lista de Modelos

1. Cintia entra a `/admin/collections/modelos`.
2. Mira la grilla y, a la derecha de la columna **Destacado**, ve una
   columna nueva titulada **Estado**.
3. Todas las filas existentes muestran el texto **Nueva** (default
   aplicado por la migracion).

**Acceptance**: el `<th>` de la tabla contiene el texto literal `Estado` y
toda fila de Modelo legacy muestra `Nueva`.

---

## Step 2 — Cintia filtra la lista por estado

1. Cintia despliega el filtro estandar de Payload arriba de la lista (boton
   "Filters" / "Filtros").
2. Selecciona el campo **Estado** y el operador `equals`, valor `En stock`.
3. La grilla se vacia (todavia ningun Modelo paso al estado "En stock"; todos
   estan en "Nueva" por la migracion).
4. Cintia cambia el filtro a `equals` `Nueva`. La grilla muestra de nuevo
   los ~14 Modelos legacy.

**Acceptance**: el filtro por estado funciona para los 5 valores y la URL
incluye `where[estado][equals]=<valor>`.

---

## Step 3 — Cintia crea un Modelo nuevo y arranca la produccion

1. Cintia hace click en **Crear**.
2. Llena nombre "Capa Tierra Hechizo", tipo "Falda", descripcion poetica.
3. En el sidebar derecho ve el campo **Estado**. Esta por default en
   `Nueva`. Lo deja asi.
4. Guarda. El Modelo aparece en la lista con `Estado = Nueva`.
5. Vuelve a abrir el Modelo, abre el bloque **Variantes**, agrega 4 variantes
   (XS / S / M / L). Para cada una llena tela1, descuento si corresponde, y
   el campo nuevo **Metros requeridos por unidad** (XS: 1.05, S: 1.15, M:
   1.25, L: 1.40). Guarda.
6. Cuando arranca la produccion al taller, edita el Modelo otra vez, cambia
   **Estado** a `En produccion`, guarda.

**Acceptance**: persisten el estado `en_produccion` + los 4 valores
decimales de metrosRequeridos. Re-abrir el Modelo los muestra exactos.

---

## Step 4 — Cintia recibe la primera tanda del taller y la marca En stock

1. Cintia abre el Modelo "Capa Tierra Hechizo" (estado actual: `En produccion`).
2. Cambia **Estado** a `En stock`.
3. Save.
4. Filtra la lista por `En stock` → ve el nuevo Modelo listo para publicar
   en Instagram.

**Nota G-16**: en este task la transicion `En produccion → En stock` NO esta
validada por un hook todavia — cualquier transicion es libre. La validacion
formal de transiciones llega con G-N+1 (modelos-state-machine hook).

**Acceptance**: el cambio persiste; la fila figura bajo el filtro.

---

## Step 5 — Cintia confirma que la storefront NO cambia (AC-7)

1. Cintia (o Gabriel) navega a `/tienda` desde otra pestana.
2. Ningun cambio visible en las prendas. La clienta NO ve `estado: en_stock`
   ni `metrosRequeridos`. La senal `sinStock` de cada Variante sigue siendo
   el unico indicador visible para la clienta.

**Acceptance**: snapshot del JSON publico (`/api/modelos/[slug]`) NO contiene
ningun campo nuevo (ni `estado` ni `metrosRequeridos`).

---

## Flow C — Bootstrap one-time de Modelos legacy

Despues del deploy de G-16, los 14 Modelos viejos quedan en `Nueva` por
defecto. Cintia hace bootstrap en ~5-10 minutos:

1. Filtra la lista por `Estado = Nueva`.
2. Para cada Modelo que ya esta vendiendose (Caracol, Hechizo, etc.):
   - Editar → Estado → `En produccion` → Guardar.
   - Editar de nuevo → Estado → `En stock` → Guardar.
   - (Dos pasos porque la transicion directa Nueva → En stock estara
     bloqueada cuando G-N+1 active el hook. En G-16 todavia es libre, pero
     mejor practicar el flujo correcto desde ahora.)
3. Para los 3 "Proximamente" (Sagrada, Corazonada, Luz y Sombra):
   - Si ya estan en el taller: `En produccion`.
   - Si siguen siendo solo idea: dejarlos en `Nueva`.
4. Si hay alguno retirado de linea: `Descontinuada`.

---

## Notas para Cintia

- El campo **Metros requeridos por unidad** lo podes dejar en blanco en
  Variantes viejas (no se rompe nada). Para Variantes nuevas (proximas
  Coleciones Capa Transmutacion: Tierra Abr 12, Fuego May 12, Agua Jun 10,
  Aire Jul 10) pedimos que lo llenes siempre. Despues el sistema lo va a
  usar para:
  1. Avisarte cuando una Tela este por agotarse (telasStockProjection, S-8).
  2. Calcular el costo de tela por prenda (pricing, S-11).
- Las clientas en la tienda online NO ven nada nuevo. Es informacion interna.

---

## Edge cases verificados en tests automatizados

- `metrosRequeridos < 0` → error en espanol "metros requeridos no puede ser
  negativo".
- `metrosRequeridos > 50` → error en espanol "metros requeridos no puede
  superar 50 (limite de seguridad)".
- `metrosRequeridos = null` → valido (campo opcional).
- `estado` con valor desconocido (e.g. `bogus`) → Payload rechaza por enum
  constraint antes de llegar al storage.

Ver tests:
- `tests/unit/collections/modelo-estado-field.test.ts`
- `tests/unit/collections/variante-metrosRequeridos-field.test.ts`
- `tests/resilience/modelo-estado-invalid-rejected.test.ts`
- `tests/resilience/variante-metrosRequeridos-bounds.test.ts`
- `tests/integration/modelos-migration-apply.test.ts`
- `tests/integration/modelos-migration-rollback.test.ts`
- `tests/e2e/F-modelo-estado-admin-G-16.spec.ts` (Playwright-gated)
