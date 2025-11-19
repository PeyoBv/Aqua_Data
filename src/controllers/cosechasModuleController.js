/**
 * Cosechas Module Controller
 * 
 * Controlador para el módulo avanzado de análisis de cosechas.
 * Integra los métodos de Python del archivo fishery_analytics.py
 * 
 * Author: Barri - Aqua-Data PM
 * Date: 2025-11-19
 */

const dataStore = require('../data/dataStore');

class CosechasModuleController {
  /**
   * GET /api/v1/cosechas/agent-distribution
   * Distribución por Tipo de Agente (Industrial vs Artesanal)
   * 
   * @param {Object} req.query.year - Año específico (opcional)
   * @param {Object} req.query.region - Región específica (opcional)
   */
  async getAgentDistribution(req, res) {
    try {
      const { year, region } = req.query;
      
      // Obtener datos de desembarques
      let data = dataStore.getDesembarques();
      
      if (!data || data.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No hay datos de desembarques disponibles'
        });
      }

      // Aplicar filtros
      if (year) {
        const yearNum = parseInt(year);
        data = data.filter(row => parseInt(row.año) === yearNum);
      }

      if (region && region !== 'TODAS') {
        const regionUpper = region.toUpperCase().trim();
        data = data.filter(row => row.region && row.region.toUpperCase().trim() === regionUpper);
      }

      // Validar que haya datos después del filtrado
      if (data.length === 0) {
        return res.json({
          success: false,
          error: 'No hay datos disponibles para los filtros especificados',
          data: [],
          summary: {}
        });
      }

      // Agrupar por Tipo de agente y sumar toneladas
      const agentMap = new Map();
      
      data.forEach(row => {
        const tipoAgente = row.tipo_agente;
        const toneladas = parseFloat(row.toneladas) || 0;
        
        if (tipoAgente) {
          const current = agentMap.get(tipoAgente) || 0;
          agentMap.set(tipoAgente, current + toneladas);
        }
      });

      // Calcular total
      let totalToneladas = 0;
      for (const toneladas of agentMap.values()) {
        totalToneladas += toneladas;
      }

      // Convertir a array y calcular porcentajes
      const distribution = [];
      for (const [tipoAgente, toneladas] of agentMap.entries()) {
        const porcentaje = totalToneladas > 0 
          ? parseFloat(((toneladas / totalToneladas) * 100).toFixed(2))
          : 0;
        
        distribution.push({
          tipo_agente: tipoAgente,
          toneladas: parseFloat(toneladas.toFixed(2)),
          porcentaje
        });
      }

      // Ordenar por toneladas descendente
      distribution.sort((a, b) => b.toneladas - a.toneladas);

      // Generar summary
      const summary = {
        total_toneladas: parseFloat(totalToneladas.toFixed(2)),
        num_tipos_agente: distribution.length,
        tipo_dominante: distribution.length > 0 ? distribution[0].tipo_agente : null,
        porcentaje_dominante: distribution.length > 0 ? distribution[0].porcentaje : 0
      };

      res.json({
        success: true,
        analysis_type: 'agent_distribution',
        metadata: {
          year: year ? parseInt(year) : null,
          region: region || null,
          generated_at: new Date().toISOString()
        },
        data: distribution,
        summary
      });

    } catch (error) {
      console.error('Error in getAgentDistribution:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener distribución por agente',
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/cosechas/top-ports
   * Ranking de Puertos por Volumen
   * 
   * @param {Object} req.query.year - Año específico (opcional)
   * @param {Object} req.query.region - Región específica (opcional)
   * @param {Object} req.query.top_n - Número de puertos (default: 10)
   */
  async getTopPorts(req, res) {
    try {
      const { year, region, top_n = 10 } = req.query;
      const topN = parseInt(top_n);
      
      // Obtener datos de desembarques
      let data = dataStore.getDesembarques();
      
      if (!data || data.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No hay datos de desembarques disponibles'
        });
      }

      // Aplicar filtros
      if (year) {
        const yearNum = parseInt(year);
        data = data.filter(row => parseInt(row.año) === yearNum);
      }

      if (region && region !== 'TODAS') {
        const regionUpper = region.toUpperCase().trim();
        data = data.filter(row => row.region && row.region.toUpperCase().trim() === regionUpper);
      }

      // Validar que haya datos
      if (data.length === 0) {
        return res.json({
          success: false,
          error: 'No hay datos disponibles para los filtros especificados',
          data: [],
          summary: {}
        });
      }

      // Agrupar por Puerto y sumar toneladas
      const portMap = new Map();
      
      data.forEach(row => {
        const puerto = row.puerto_desembarque;
        const toneladas = parseFloat(row.toneladas) || 0;
        
        if (puerto) {
          const current = portMap.get(puerto) || 0;
          portMap.set(puerto, current + toneladas);
        }
      });

      // Convertir a array y ordenar
      const ports = [];
      for (const [puerto, toneladas] of portMap.entries()) {
        ports.push({
          puerto,
          toneladas: parseFloat(toneladas.toFixed(2))
        });
      }

      ports.sort((a, b) => b.toneladas - a.toneladas);

      // Tomar top N
      const topPorts = ports.slice(0, topN);

      // Agregar ranking
      topPorts.forEach((port, index) => {
        port.ranking = index + 1;
      });

      // Calcular estadísticas
      const totalTopN = topPorts.reduce((sum, p) => sum + p.toneladas, 0);
      const totalGeneral = ports.reduce((sum, p) => sum + p.toneladas, 0);
      const porcentajeConcentracion = totalGeneral > 0 
        ? parseFloat(((totalTopN / totalGeneral) * 100).toFixed(2))
        : 0;

      const summary = {
        total_toneladas_top_n: parseFloat(totalTopN.toFixed(2)),
        total_toneladas_general: parseFloat(totalGeneral.toFixed(2)),
        porcentaje_concentracion: porcentajeConcentracion,
        num_puertos_total: ports.length,
        puerto_lider: topPorts.length > 0 ? topPorts[0].puerto : null
      };

      res.json({
        success: true,
        analysis_type: 'top_ports',
        metadata: {
          year: year ? parseInt(year) : null,
          region: region || null,
          top_n: topN,
          generated_at: new Date().toISOString()
        },
        data: topPorts,
        summary
      });

    } catch (error) {
      console.error('Error in getTopPorts:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener ranking de puertos',
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/cosechas/species-breakdown
   * Desglose de Especies por Tipo de Agente
   * 
   * @param {Object} req.query.year - Año específico (opcional)
   * @param {Object} req.query.region - Región específica (opcional)
   * @param {Object} req.query.top_n - Número de especies (default: 10)
   */
  async getSpeciesByAgentBreakdown(req, res) {
    try {
      const { year, region, top_n = 10 } = req.query;
      const topN = parseInt(top_n);
      
      // Obtener datos de desembarques
      let data = dataStore.getDesembarques();
      
      if (!data || data.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No hay datos de desembarques disponibles'
        });
      }

      // Aplicar filtros
      if (year) {
        const yearNum = parseInt(year);
        data = data.filter(row => parseInt(row.año) === yearNum);
      }

      if (region && region !== 'TODAS') {
        const regionUpper = region.toUpperCase().trim();
        data = data.filter(row => row.region && row.region.toUpperCase().trim() === regionUpper);
      }

      if (data.length === 0) {
        return res.json({
          success: false,
          error: 'No hay datos disponibles para los filtros especificados',
          data: [],
          summary: {}
        });
      }

      // Paso 1: Identificar top N especies por volumen total
      const speciesMap = new Map();
      
      data.forEach(row => {
        const especie = row.especie;
        const toneladas = parseFloat(row.toneladas) || 0;
        
        if (especie) {
          const current = speciesMap.get(especie) || 0;
          speciesMap.set(especie, current + toneladas);
        }
      });

      // Ordenar especies por toneladas
      const speciesArray = Array.from(speciesMap.entries())
        .map(([especie, toneladas]) => ({ especie, toneladas }))
        .sort((a, b) => b.toneladas - a.toneladas)
        .slice(0, topN);

      const topSpeciesList = new Set(speciesArray.map(s => s.especie));

      // Paso 2: Filtrar datos solo para esas especies
      const filteredData = data.filter(row => topSpeciesList.has(row.especie));

      // Paso 3: Crear pivot por Especie y Tipo de agente
      const pivotMap = new Map();
      const agentTypes = new Set();

      filteredData.forEach(row => {
        const especie = row.especie;
        const tipoAgente = row.tipo_agente;
        const toneladas = parseFloat(row.toneladas) || 0;

        if (especie && tipoAgente) {
          agentTypes.add(tipoAgente);
          
          if (!pivotMap.has(especie)) {
            pivotMap.set(especie, {});
          }
          
          const specieData = pivotMap.get(especie);
          specieData[tipoAgente] = (specieData[tipoAgente] || 0) + toneladas;
        }
      });

      // Convertir a array
      const breakdown = [];
      const agentTypesArray = Array.from(agentTypes);
      const participacionPorTipo = {};
      
      // Inicializar participación por tipo
      agentTypesArray.forEach(agent => {
        participacionPorTipo[agent] = 0;
      });

      for (const [especie, agents] of pivotMap.entries()) {
        const row = { especie };
        let total = 0;

        agentTypesArray.forEach(agentType => {
          const value = parseFloat((agents[agentType] || 0).toFixed(2));
          row[agentType] = value;
          total += value;
          participacionPorTipo[agentType] += value;
        });

        row.total = parseFloat(total.toFixed(2));
        breakdown.push(row);
      }

      // Ordenar por total descendente
      breakdown.sort((a, b) => b.total - a.total);

      // Redondear participación por tipo
      Object.keys(participacionPorTipo).forEach(key => {
        participacionPorTipo[key] = parseFloat(participacionPorTipo[key].toFixed(2));
      });

      const totalToneladas = breakdown.reduce((sum, item) => sum + item.total, 0);

      const summary = {
        num_especies: breakdown.length,
        tipos_agente: agentTypesArray,
        total_toneladas: parseFloat(totalToneladas.toFixed(2)),
        especie_lider: breakdown.length > 0 ? breakdown[0].especie : null,
        participacion_por_tipo: participacionPorTipo
      };

      res.json({
        success: true,
        analysis_type: 'species_by_agent_breakdown',
        metadata: {
          year: year ? parseInt(year) : null,
          region: region || null,
          top_n: topN,
          generated_at: new Date().toISOString()
        },
        data: breakdown,
        summary
      });

    } catch (error) {
      console.error('Error in getSpeciesByAgentBreakdown:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener desglose de especies por agente',
        message: error.message
      });
    }
  }

  /**
   * GET /api/v1/cosechas/seasonal-context
   * Contexto Estacional: Año Actual vs Promedio Histórico
   * 
   * @param {Object} req.query.current_year - Año actual (default: 2023)
   * @param {Object} req.query.region - Región específica (opcional)
   */
  async getSeasonalContext(req, res) {
    try {
      const { current_year = 2023, region } = req.query;
      const currentYear = parseInt(current_year);
      
      // Obtener datos de desembarques
      let data = dataStore.getDesembarques();
      
      if (!data || data.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No hay datos de desembarques disponibles'
        });
      }

      // Aplicar filtro regional
      if (region && region !== 'TODAS') {
        const regionUpper = region.toUpperCase().trim();
        data = data.filter(row => row.region && row.region.toUpperCase().trim() === regionUpper);
      }

      if (data.length === 0) {
        return res.json({
          success: false,
          error: 'No hay datos disponibles para los filtros especificados',
          data: [],
          summary: {}
        });
      }

      // Separar datos del año actual y años históricos
      const currentYearData = data.filter(row => parseInt(row.año) === currentYear);
      const historicalData = data.filter(row => parseInt(row.año) < currentYear);

      // Calcular suma mensual para el año actual
      const currentMonthMap = new Map();
      currentYearData.forEach(row => {
        const mes = parseInt(row.mes);
        const toneladas = parseFloat(row.toneladas) || 0;
        
        if (mes) {
          const current = currentMonthMap.get(mes) || 0;
          currentMonthMap.set(mes, current + toneladas);
        }
      });

      // Calcular promedio mensual histórico
      const historicalMonthMap = new Map();
      const historicalCountMap = new Map();

      historicalData.forEach(row => {
        const mes = parseInt(row.mes);
        const toneladas = parseFloat(row.toneladas) || 0;
        
        if (mes) {
          const currentSum = historicalMonthMap.get(mes) || 0;
          const currentCount = historicalCountMap.get(mes) || 0;
          
          historicalMonthMap.set(mes, currentSum + toneladas);
          historicalCountMap.set(mes, currentCount + 1);
        }
      });

      // Nombres de meses
      const mesesNombres = {
        1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
        5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
        9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
      };

      // Construir array con todos los meses
      const seasonal = [];
      for (let mes = 1; mes <= 12; mes++) {
        const actual = currentMonthMap.get(mes) || 0;
        const historicoSum = historicalMonthMap.get(mes) || 0;
        const historicoCount = historicalCountMap.get(mes) || 1;
        const historico = historicoSum / historicoCount;

        const diferencia = actual - historico;
        const variacionPorcentual = historico > 0 
          ? parseFloat(((diferencia / historico) * 100).toFixed(2))
          : 0;

        seasonal.push({
          mes,
          mes_nombre: mesesNombres[mes],
          actual: parseFloat(actual.toFixed(2)),
          historico: parseFloat(historico.toFixed(2)),
          diferencia: parseFloat(diferencia.toFixed(2)),
          variacion_porcentual: variacionPorcentual
        });
      }

      // Calcular estadísticas
      const totalActual = seasonal.reduce((sum, m) => sum + m.actual, 0);
      const totalHistorico = seasonal.reduce((sum, m) => sum + m.historico, 0);
      const diferenciaTotal = totalActual - totalHistorico;
      const variacionAnual = totalHistorico > 0 
        ? parseFloat(((diferenciaTotal / totalHistorico) * 100).toFixed(2))
        : 0;

      const mesMaxActual = seasonal.reduce((max, m) => m.actual > max.actual ? m : max, seasonal[0]);
      const mesMaxHistorico = seasonal.reduce((max, m) => m.historico > max.historico ? m : max, seasonal[0]);

      // Contar años históricos únicos
      const añosHistoricos = new Set(historicalData.map(row => parseInt(row.año)));

      const summary = {
        año_actual: currentYear,
        años_historicos_incluidos: añosHistoricos.size,
        total_actual: parseFloat(totalActual.toFixed(2)),
        total_historico: parseFloat(totalHistorico.toFixed(2)),
        diferencia_total: parseFloat(diferenciaTotal.toFixed(2)),
        variacion_anual: variacionAnual,
        mes_mayor_actual: mesMaxActual.mes_nombre,
        mes_mayor_historico: mesMaxHistorico.mes_nombre
      };

      res.json({
        success: true,
        analysis_type: 'seasonal_context',
        metadata: {
          current_year: currentYear,
          region: region || null,
          generated_at: new Date().toISOString()
        },
        data: seasonal,
        summary
      });

    } catch (error) {
      console.error('Error in getSeasonalContext:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener contexto estacional',
        message: error.message
      });
    }
  }
}

module.exports = new CosechasModuleController();
