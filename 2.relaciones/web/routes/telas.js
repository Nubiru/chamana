/**
 * Rutas de Telas - Fase 2: 2NF
 *
 * Endpoints para consultar telas por temporada/año.
 * Demuestra 2NF mediante tabla junction telas_temporadas.
 */

const express = require('express');
const router = express.Router();
const telasService = require('../services/telas.service');

/**
 * GET /api/telas/temporadas - ⭐ NEW
 * Obtener telas filtradas por temporada y/o año
 *
 * Query params:
 *   ?temporada=Invierno (opcional)
 *   ?año=2025 (opcional)
 *   ?activo=true (opcional)
 *
 * Ejemplo:
 *   /api/telas/temporadas?temporada=Invierno&año=2025&activo=true
 *
 * Retorna telas disponibles para la temporada/año especificado.
 * Demuestra 2NF: una tela puede estar en múltiples temporadas/años.
 */
router.get('/temporadas', async (req, res, next) => {
  try {
    const { temporada, año, activo } = req.query;

    const telas = await telasService.getFabricsBySeasonYear({
      temporada,
      año: año ? parseInt(año, 10) : undefined,
      activo: activo === 'true',
    });

    res.json(telas);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/telas/seasons - Obtener todas las temporadas
 *
 * Útil para poblar dropdowns en frontend.
 */
router.get('/seasons', async (_req, res, next) => {
  try {
    const seasons = await telasService.getAllSeasons();
    res.json(seasons);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/telas/years - Obtener todos los años
 *
 * Útil para poblar dropdowns en frontend.
 */
router.get('/years', async (_req, res, next) => {
  try {
    const years = await telasService.getAllYears();
    res.json(years);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
