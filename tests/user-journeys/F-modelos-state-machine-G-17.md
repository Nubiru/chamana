# User-Journey — F-Variante-metrosRequeridos-Modelo-estado / G-17

**Spec**: `.context/active/agents/sigma/we-expect/F-variante-metrosRequeridos-modelo-estado.md`
**Task**: G-17 (HOOK half — Modelo lifecycle transition validation + Spanish error)
**Pairs with**: `F-modelo-estado-variante-metros-G-16.md` (FIELD half — shipped 2026-05-21)
**Audience**: Cintia. Phone-friendly.
**Pre-condition**: G-16 migration applied + G-17 hook deployed + Cintia logged in.

---

## Premisa

A partir de ahora el sistema TE FRENA si intentas cambiar el Estado de un
Modelo de manera ilogica. No podes saltarte la etapa de produccion: un
Modelo siempre se cose ANTES de poder venderse. Tampoco podes resucitar
un Modelo que descontinuaste — eso es definitivo.

---

## Step 1 — Crear un Modelo nuevo (estado: Nueva por defecto)

1. `/admin/collections/modelos` → boton **Crear**.
2. Llenar nombre "Capa Tierra Hechizo" + tipo "Falda" + descripcion + tela.
3. Sidebar muestra **Estado: Nueva** (defaultValue).
4. **Save**. Sin error.

**Acceptance**: el create no valida transicion (Cintia entra al sistema con
estado: nueva por defecto).

---

## Step 2 — Pasar a "En produccion" (transicion valida)

1. Editar el Modelo creado en Step 1.
2. Cambiar **Estado** a **En produccion**.
3. **Save**. Sin error.
4. Reload — persiste.

**Acceptance**: `nueva → en_produccion` allowed por la matriz AC-5.

---

## Step 3 — Intentar saltar de "En produccion" a "Sin stock" (INVALIDO — ver error)

1. Con el Modelo en **En produccion**, cambiar **Estado** a **Sin stock**.
2. **Save**.
3. **VER ERROR en pantalla** (cartel rojo arriba del formulario):

   > **No se puede cambiar el estado de "En produccion" a "Sin stock". Transiciones permitidas: Nueva, En stock, Descontinuada.**

4. El Modelo queda en **En produccion** — no se guardo el intento invalido.

**Acceptance**: AC-5/6 error verbatim visible; estado original preservado.

---

## Step 4 — Pasar a "En stock" (transicion valida)

1. Con el Modelo en **En produccion**, cambiar **Estado** a **En stock**.
2. **Save**. Sin error.
3. Reload — persiste.

**Acceptance**: `en_produccion → en_stock` allowed (primer batch listo).

---

## Step 5 — Intentar saltar de "Nueva" a "En stock" directo (INVALIDO)

1. Crear otro Modelo "Capa Fuego Corazonada" → estado: Nueva por defecto.
2. Antes de pasar por En produccion, cambiar **Estado** a **En stock**.
3. **Save**.
4. **VER ERROR**:

   > **No se puede cambiar el estado de "Nueva" a "En stock". Transiciones permitidas: En produccion, Descontinuada.**

**Acceptance**: AC-9 Flow B — Cintia entiende que tiene que pasar por
**En produccion** primero.

---

## Step 6 — Marcar "Sin stock" (todas las variantes agotadas)

1. Con el Modelo "Capa Tierra Hechizo" en **En stock**, cambiar **Estado**
   a **Sin stock**.
2. **Save**. Sin error.
3. Reload — persiste.

**Acceptance**: `en_stock → sin_stock` allowed.

---

## Step 7 — Reposicion: pasar a "En produccion" → "En stock" otra vez

1. Con el Modelo en **Sin stock**, cambiar **Estado** a **En produccion**.
2. **Save**. Sin error (Cintia mando otra tanda al taller).
3. Cuando llegue la reposicion, cambiar a **En stock**. **Save**. Sin error.

**Acceptance**: `sin_stock → en_produccion → en_stock` ciclo de reposicion
funciona.

---

## Step 8 — Descontinuar (estado terminal)

1. Cambiar **Estado** a **Descontinuada**.
2. **Save**. Sin error.
3. Intentar volver a cualquier otro estado (e.g., **En stock**).
4. **Save**.
5. **VER ERROR**:

   > **No se puede cambiar el estado de "Descontinuada" a "En stock". Transiciones permitidas: ninguna (estado final).**

**Acceptance**: `descontinuada` es one-way; cualquier intento de salir falla.

---

## Step 9 — Bootstrap one-time de los 14 Modelos legacy (post-deploy)

Despues del deploy de G-16/G-17, los ~14 Modelos viejos quedaron en **Nueva**
por defecto. Para cada uno:

1. Filtrar la lista de Modelos por **Estado: Nueva**.
2. Para los Modelos que ya estan vendiendose (Caracol, Hechizo, etc.):
   editar → Estado → **En produccion** → Save → editar de nuevo → **En stock** → Save.
   (Dos pasos porque la transicion directa Nueva → En stock esta bloqueada.)
3. Para los 3 "Proximamente" (Sagrada, Corazonada, Luz y Sombra): si ya
   estan en taller, pasarlos a **En produccion**; si todavia son idea,
   dejarlos en **Nueva**.
4. Para los que se retiraron: **Descontinuada**.

**Acceptance**: ~5-10 minutos de trabajo manual. Despues del bootstrap, ya
no se vuelve a tocar el Estado salvo cambio real de ciclo de vida.

---

## Notas para Cintia

- Las transiciones permitidas siguen una logica fisica:
  - Un Modelo **Nuevo** solo puede arrancar **En produccion** o ser
    **Descontinuado**. No puede aparecer "En stock" sin pasar por el taller.
  - Un Modelo **En produccion** puede volver a **Nueva** (cancelar la
    produccion) o avanzar a **En stock** (primer batch listo). NO puede
    saltar directo a **Sin stock**.
  - **En stock** y **Sin stock** son bidireccionales: vendiste todo
    (en_stock → sin_stock) o recibiste un buffer no contado (sin_stock →
    en_stock).
  - **Descontinuada** es definitiva. Si en algun momento queres rehacerlo,
    crea un Modelo nuevo (con el mismo nombre si queres).
- Los Metros requeridos por unidad (campo de variante, G-16) NO se ven
  afectados por estos estados; los podes llenar en cualquier momento.
- La tienda online no muestra nada de este Estado a las clientas — es
  informacion interna de gestion para vos.

---

## Tests automatizados que cubren este flujo

- `tests/unit/lib/domain/models/state-machine.test.ts` — 25-pair matrix + helpers + Spanish error format.
- `tests/integration/modelos-state-machine-hook.test.ts` — create + valid updates + invalid throws + no-op.
- `tests/resilience/modelos-state-machine-descontinuada-terminal.test.ts` — descontinuada → * all rejected.
- `tests/resilience/modelos-state-machine-undefined-estado.test.ts` — defensive defaults.
- `tests/e2e/F-modelos-state-machine-transitions-G-17.spec.ts` — Playwright-gated; multi-step admin walkthrough including the invalid-transition error visible in admin UI.
