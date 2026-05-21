# User-Journey — F-Telas-state-machine / G-14

**Spec**: `.context/active/agents/sigma/we-expect/F-telas-state-machine.md`
**Task**: G-14 (HOOK half — transition validation + Spanish error)
**Pairs with**: `F-telas-state-machine-G-13.md` (field + admin UX)
**Audience**: Cintia. Phone-friendly.
**Pre-condition**: G-13 migration applied + G-14 hook deployed + Cintia logged in.

---

## Premisa

A partir de ahora el sistema TE FRENA si intentás transicionar una tela entre
estados de manera ilógica. Antes podías cambiar `Agotada` a `Disponible`
directamente; ahora el sistema te exige pasar por `Pedida` (porque físicamente
una tela agotada solo vuelve a estar disponible cuando llega la reposición
del proveedor).

---

## Step 1 — Abrir tela "LinMarCho" (estado: Disponible)

1. `/admin/collections/telas`
2. Buscar / abrir LinMarCho.
3. Sidebar muestra **Estado: Disponible** y **Lead time (dias): vacío**.

---

## Step 2 — Marcar "Por agotarse" (transición válida)

1. Cambiar **Estado** a **Por agotarse**.
2. **Save**. Sin error.
3. Reload — persiste.

**Acceptance**: `disponible → por_agotarse` allowed por la matriz AC-5.

---

## Step 3 — Intentar saltar de "Por agotarse" a "Disponible" (válido)

1. Cambiar **Estado** a **Disponible**.
2. **Save**. Sin error (Cintia recibió un buffer no contabilizado).
3. Reload — persiste.

**Acceptance**: `por_agotarse → disponible` allowed.

---

## Step 4 — Llevar a "Agotada"

1. Cambiar **Estado** a **Por agotarse** → Save.
2. Cambiar a **Agotada** → Save. Sin error.

**Acceptance**: `por_agotarse → agotada` allowed.

---

## Step 5 — Intentar saltar de "Agotada" a "Disponible" (INVÁLIDO — ver error)

1. Con la tela en **Agotada**, cambiar **Estado** a **Disponible**.
2. **Save**.
3. **VER ERROR en pantalla** (cartel rojo arriba del formulario):

   > **No se puede cambiar el estado de "Agotada" a "Disponible". Transiciones permitidas: Pedida, Descontinuada.**

4. La tela queda en **Agotada** — no se guardó el intento inválido.

**Acceptance**: AC-6 verbatim Spanish error visible; estado original preservado.

---

## Step 6 — Marcar "Pedida" y llenar Lead time

1. Cambiar **Estado** a **Pedida** → Save. Sin error.
2. Llenar **Lead time (dias)**: `14` → Save.

**Acceptance**: `agotada → pedida` allowed; leadTimeDias acepta valor.

---

## Step 7 — Marcar "Disponible" (llegó la reposición)

1. Después de 14 días reales (o ahora si estás probando), cambiar **Estado**
   a **Disponible** → Save. Sin error.

**Acceptance**: `pedida → disponible` allowed (ciclo completo cerrado).

---

## Step 8 — Discontinuar la tela (estado terminal)

1. Cambiar **Estado** a **Descontinuada** → Save. Sin error.
2. Intentar volver a cualquier otro estado (e.g., **Disponible**) → Save.
3. **VER ERROR**:

   > **No se puede cambiar el estado de "Descontinuada" a "Disponible". Transiciones permitidas: ninguna (estado final).**

**Acceptance**: `discontinuada` es one-way; cualquier intento de salir falla.

---

## Notas para Cintia

- Las transiciones permitidas desde cada estado siguen una lógica física:
  - Una tela **Agotada** solo vuelve a estar disponible cuando llega una
    **Pedida**. No "resucita" sola.
  - Una tela **Pedida** no puede pasar a **Agotada** sin antes pasar por
    **Disponible** (un pedido no se agota antes de llegar).
  - **Descontinuada** es definitiva. Si el proveedor vuelve a fabricarla,
    creá una tela nueva con el mismo código (o uno nuevo).
- El sistema te muestra el error en castellano; si lees algo en inglés,
  avisanos.

---

## Tests automatizados que cubren este flujo

- `tests/unit/lib/domain/textiles/state-machine.test.ts` (≥18 cases: 25-pair matrix + helpers + Spanish error format).
- `tests/integration/telas-state-machine-hook.test.ts` (9 cases: create + valid updates + invalid throws + no-op).
- `tests/resilience/telas-state-machine-discontinuada-terminal.test.ts` (5 cases: discontinuada → * all rejected).
- `tests/resilience/telas-state-machine-undefined-estado.test.ts` (3 cases: defensive defaults).
- `tests/e2e/F-telas-state-machine-transitions-G-14.spec.ts` (Playwright-gated; 1 multi-step admin walkthrough including the invalid-transition error visible in admin UI).
