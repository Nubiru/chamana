// =====================================================
// Telas Service - Fase 2: 2NF
// Proyecto: CHAMANA - E-commerce de Ropa Femenina
// Fecha: 23 de Octubre, 2025
// Versión: 2.0.0
// =====================================================
/**
 * Servicio de Telas
 *
 * Maneja lógica de telas y temporadas (demuestra 2NF).
 * La tabla junction telas_temporadas elimina dependencias parciales.
 */

const BaseService = require('./base.service');
const logger = require('../config/logger');

class TelasService extends BaseService {
  /**
   * Obtener telas por temporada y año
   *
   * Demuestra 2NF: elimina dependencias parciales mediante tabla junction.
   * Una tela puede estar disponible en múltiples temporadas/años.
   *
   * @param {Object} filters - Filtros
   * @param {string} filters.temporada - Nombre de temporada (Verano, Invierno)
   * @param {number} filters.año - Año (2024, 2025, ...)
   * @param {boolean} filters.activo - Filtrar por activo
   * @returns {Promise<Array>} Telas disponibles
   */
  async getFabricsBySeasonYear({ temporada, año, activo } = {}) {
    let query = `
      SELECT 
        t.id,
        t.nombre,
        t.tipo,
        t.descripcion,
        t.costo_por_metro,
        temp.nombre AS temporada_nombre,
        a.año AS año_valor,
        tt.activo,
        tt.fecha_inicio,
        tt.fecha_fin
      FROM telas t
      JOIN telas_temporadas tt ON t.id = tt.tela_id
      JOIN temporadas temp ON tt.temporada_id = temp.id
      JOIN años a ON tt.año_id = a.id
    `;

    const conditions = [];
    const params = [];

    if (temporada) {
      params.push(temporada);
      conditions.push(`temp.nombre = $${params.length}`);
    }

    if (año) {
      params.push(parseInt(año, 10));
      conditions.push(`a.año = $${params.length}`);
    }

    if (activo !== undefined) {
      params.push(activo);
      conditions.push(`tt.activo = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY t.nombre';

    const result = await this.executeQuery(query, params);

    logger.info('Telas por temporada obtenidas', {
      count: result.rows.length,
      filters: { temporada, año, activo },
    });

    return result.rows;
  }

  /**
   * Obtener todas las temporadas disponibles
   *
   * @returns {Promise<Array>} Lista de temporadas
   */
  async getAllSeasons() {
    const result = await this.executeQuery('SELECT id, nombre FROM temporadas ORDER BY nombre');

    return result.rows;
  }

  /**
   * Obtener todos los años disponibles
   *
   * @returns {Promise<Array>} Lista de años
   */
  async getAllYears() {
    const result = await this.executeQuery('SELECT id, año FROM años ORDER BY año DESC');

    return result.rows;
  }
}

module.exports = new TelasService();

// =====================================================
// FIN DE TELAS SERVICE
// =====================================================
