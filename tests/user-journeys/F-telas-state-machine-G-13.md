# User-Journey — F-Telas-state-machine / G-13

**Spec**: `.context/active/agents/sigma/we-expect/F-telas-state-machine.md`
**Task**: G-13 (field + migration + admin UX — half-1 of the F arc)
**Audience**: Cintia. Phone-friendly. Run after Gabriel applies the migration
in production (or in dev after `pnpm payload migrate`).
**Out of scope for G-13**: state-transition validation (skip-Pedida-error
walkthrough). That lands with G-14 and gets a sibling journey.

---

## Pre-condition

- Migration `20260520_230000_add_telas_estado_leadTimeDias` applied. All
  ~30 existing telas in the DB have `estado: 'disponible'` and
  `leadTimeDias: null` by default.
- Cintia is logged in at `/admin/login`.

---

## Step 1 — Cintia ve la nueva columna Estado en la lista de Telas

1. Cintia entra a `/admin/collections/telas`.
2. Mira la grilla y, a la derecha de la columna **Color HEX**, ve una
   columna nueva titulada **Estado**.
3. Todas las filas existentes muestran el texto **Disponible** (default
   aplicado por la migración).

**Acceptance**: el `<th>` de la tabla contiene el texto literal `Estado` y
toda fila de tela legacy muestra `Disponible`.

---

## Step 2 — Cintia filtra la lista por estado

1. Cintia despliega el filtro estándar de Payload arriba de la lista (botón
   "Filters" / "Filtros").
2. Selecciona el campo **Estado** y el operador `equals`, valor `Por agotarse`.
3. La grilla se vacía (todavía no hay telas marcadas así).
4. Cintia cambia el filtro a `equals` `Disponible`. La grilla muestra de
   nuevo las ~30 telas legacy.

**Acceptance**: el filtro por estado funciona para los 5 valores y la URL
incluye `where[estado][equals]=<valor>`.

---

## Step 3 — Cintia abre una tela y la marca como Por agotarse

1. Cintia hace click en una tela cualquiera (por ejemplo Lino-Marfil).
2. En el panel derecho (sidebar) ve dos campos nuevos:
   - **Estado** (select con 5 opciones).
   - **Lead time (dias)** (número, vacío).
3. Cambia **Estado** de `Disponible` a `Por agotarse`.
4. Presiona **Save**.
5. La tela queda guardada con `estado: 'por_agotarse'`. Volviendo a la lista
   y filtrando por `Por agotarse`, esa tela aparece.

**Acceptance**: persiste el nuevo estado; la fila figura bajo el filtro.

---

## Step 4 — Cintia marca una tela como Pedida y anota el lead time

1. Cintia abre otra tela (por ejemplo Tejido-Berenjena).
2. Cambia **Estado** a `Pedida`.
3. Llena **Lead time (dias)**: `14` (lo que dijo el proveedor).
4. Save.
5. Vuelve a abrir la misma tela → `estado: 'pedida'` + `leadTimeDias: 14`
   ambos persisten.

**Acceptance**: número guardado, sin errores de validación; el filtro
`equals Pedida` la muestra.

---

## Step 5 — Cintia confirma que la storefront NO cambia (AC-7)

1. Cintia (o Gabriel) navega a `/tienda` desde otra pestaña.
2. Ningún cambio visible en las prendas. El cliente NO ve `estado: pedida`
   ni `leadTimeDias`. La señal `sinStock` de cada Variante sigue siendo el
   único indicador visible para la clienta.

**Acceptance**: snapshot del JSON público (`/api/modelos/[slug]`) NO contiene
ningún campo nuevo de Tela.

---

## Notas para Cintia

- Por ahora, transicionar entre estados es libre — todavía no está activa la
  validación que te frena si haces algo ilógico (por ejemplo, de Agotada
  directo a Disponible). Eso se activa con el próximo deploy (tarea G-14).
- El campo **Lead time (dias)** lo podés dejar vacío salvo cuando la tela
  está en `Pedida`. Más adelante (cuando esté listo el dashboard de
  pedidos) lo vamos a usar para mostrarte "telas que llegan esta semana".

---

## Edge cases verificados en tests automatizados

- `leadTimeDias < 0` → Payload rechaza con error en español.
- `leadTimeDias > 365` → Payload rechaza con error en español.
- `estado` con valor desconocido (e.g. `bogus`) → Payload rechaza por enum
  constraint.

Ver tests:
- `tests/unit/collections/telas-estado-field.test.ts`
- `tests/unit/collections/telas-leadTimeDias-field.test.ts`
- `tests/resilience/telas-invalid-estado-rejected.test.ts`
- `tests/resilience/telas-leadTimeDias-bounds.test.ts`
- `tests/integration/telas-migration-apply.test.ts`
- `tests/integration/telas-migration-rollback.test.ts`
- `tests/e2e/F-telas-state-machine-admin-G-13.spec.ts` (Playwright-gated)
