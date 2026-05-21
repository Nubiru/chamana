# User Journey — F4: Cintia registra una venta y el stock se ajusta

**Flow ID**: F4
**Spec**: `.context/active/agents/sigma/we-expect/F4-cintia-registra-venta-stock.md`
**Hazard neutralized**: H3 (stockVendido NOT auto-incremented on Venta create)
**Audience**: Gabriel (validates manually); future: Cintia walkthrough

This is a **walkthrough script**, not an automated test. The contract it pins
is the customer-visible truth that all the unit/integration/e2e tests below
support. If this walkthrough fails after a future change, the change broke
the stock invariant — not the test.

---

## Setup

1. Local Payload admin running (`npm run dev`) at `http://localhost:3000/admin`.
2. Cintia is logged in (admin credentials).
3. Seed data: a Modelo `Hechizo` with at least one variant `hechizo-linmarmalv`
   where `stockTotal = 5` and `stockVendido = 0` (the seed defaults satisfy
   this for Coleccion Magia).
4. The storefront opens cleanly in incognito at
   `http://localhost:3000/producto/hechizo`.

## Step 1 — Verify starting state

- Open incognito → `/producto/hechizo`.
- Locate the `linmarmalv` variant.
- **Expected**: variant is selectable, NOT marked sin stock, addable to cart.

## Step 2 — Log first Venta in admin

- Admin → Ventas → Crear nueva venta.
- Compradora: `Test Customer 1`.
- Modelo: `Hechizo`.
- Variante: `hechizo-linmarmalv`.
- Precio: `32000`.
- Estado: `pendiente` (default).
- FechaVenta: today.
- Save.

- **Expected**: Venta saved successfully. NO error.
- **Expected**: Cintia does NOT navigate to Modelos and edit stockVendido manually.

## Step 3 — Verify stock auto-incremented

- Admin → Modelos → `Hechizo` → open detail → `variantes` section.
- Find `linmarmalv` row.
- **Expected**: `stockVendido = 1`, `sinStock = false` (not yet exhausted).

## Step 4 — Reload storefront

- Refresh incognito tab on `/producto/hechizo`.
- **Expected**: variant `linmarmalv` still selectable (only 1 of 5 sold).

## Step 5 — Log 4 more Ventas (total = 5)

- Repeat Step 2 four more times with compradoras `Test Customer 2/3/4/5`.
- **Expected**: each save succeeds. NO manual Modelo edits.

## Step 6 — Verify stock exhausted

- Admin → Modelos → `Hechizo` → variantes → `linmarmalv`.
- **Expected**: `stockVendido = 5`, `sinStock = true` (auto-flipped).

## Step 7 — Verify storefront hides the variant

- Refresh incognito on `/producto/hechizo`.
- **Expected**: variant `linmarmalv` shows as sin stock OR is hidden (per
  `components/store/VariantSelector` logic). NOT addable to cart.

## Step 8 — Variant swap correction

- Admin → Ventas → open Venta #5 → change Variante from `hechizo-linmarmalv`
  to `hechizo-linmarrosa`.
- Save.
- **Expected**: save succeeds.
- Admin → Modelos → `Hechizo` → variantes:
  - `linmarmalv`: `stockVendido = 4`, `sinStock = false`.
  - `linmarrosa`: `stockVendido = 1`.
- Storefront: `linmarmalv` selectable again; `linmarrosa` selectable with -1 stock left.

## Step 9 — Cancellation/refund via state transition

- Admin → Ventas → open Venta #1 → state machine: `pendiente → cancelada`.
- Save.
- **Expected**: `linmarmalv.stockVendido` decrements back by 1.

## Step 10 — Error path: unknown varianteId

- Admin → Ventas → create new Venta. Compradora: `Error Test`. Modelo:
  `Hechizo`. Variante: type a typo `hechizo-xxxnope`. Save.
- **Expected**: Payload validation error appears. Venta is NOT saved.
- Error message contains `"hechizo-xxxnope"` and `"no encontrada en modelo"`.

---

## Pass criteria

ALL ten steps behave exactly as described. Cintia performs ZERO manual
Modelo edits during the flow.

Cintia walkthrough metric (STRATEGIC_VISION row 5): inventory accuracy
remains 100% after the flow.

## Fail signature

If Step 3 shows `stockVendido = 0` after Step 2's save, the hook is
disconnected from the Ventas collection. Check `collections/Ventas.ts` for
the `afterChange: [ventasStockSync]` wiring.

If Step 8 leaves both old and new variant incremented (double-count), the
diff-aware update path is broken. Inspect
`lib/payload/hooks/ventas-stock-sync.ts` `sameTarget` branch logic.

If Step 10 saves the Venta silently, the validation throw is being swallowed
upstream. Trace the Payload hook lifecycle.
