import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { explorarDatos } from '../services/api';
import './ComparadorDatos.css';

/**
 * Vista Comparador de Datos - Comparación Visual entre Variables
 * Permite comparar años, meses, especies, regiones, etc.
 */
function ComparadorDatos({ region }) {
  const [tipoComparacion, setTipoComparacion] = useState('especies'); // especies, años, meses, regiones
  const [dataset, setDataset] = useState('cosecha');
  
  // Filtros disponibles
  const [opcionesDisponibles, setOpcionesDisponibles] = useState({
    años: [],
    meses: [],
    especies: [],
    tiposElaboracion: []
  });
  
  // Elementos seleccionados para comparar
  const [elementosComparar, setElementosComparar] = useState([]);
  const [filtrosGlobales, setFiltrosGlobales] = useState({
    año: '',
    mes: '',
    especie: '',
    tipo_elaboracion: ''
  });
  
  const [datosComparacion, setDatosComparacion] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar opciones disponibles al iniciar
  useEffect(() => {
    cargarOpciones();
  }, [region, dataset]);

  const cargarOpciones = async () => {
    try {
      const response = await explorarDatos({ tipo_dato: dataset, region });
      
      if (response.metadata) {
        setOpcionesDisponibles({
          años: response.metadata.años_disponibles || [],
          meses: response.metadata.meses_disponibles || [],
          especies: response.metadata.especies_disponibles || [],
          tiposElaboracion: response.metadata.tipos_elaboracion || []
        });
      }
    } catch (error) {
      console.error('Error cargando opciones:', error);
    }
  };

  // Agregar elemento a comparar
  const agregarElemento = (elemento) => {
    if (elemento && !elementosComparar.includes(elemento)) {
      const nuevosElementos = [...elementosComparar, elemento];
      setElementosComparar(nuevosElementos);
      realizarComparacion(nuevosElementos);
    }
  };

  // Eliminar elemento de comparación
  const eliminarElemento = (elemento) => {
    const nuevosElementos = elementosComparar.filter(e => e !== elemento);
    setElementosComparar(nuevosElementos);
    realizarComparacion(nuevosElementos);
  };

  // Realizar comparación
  const realizarComparacion = async (elementos) => {
    if (elementos.length === 0) {
      setDatosComparacion([]);
      return;
    }

    setLoading(true);
    try {
      const promesas = elementos.map(async (elemento) => {
        const params = {
          tipo_dato: dataset,
          region: region,
          ...filtrosGlobales
        };

        // Agregar parámetro específico según tipo de comparación
        if (tipoComparacion === 'especies') {
          params.especie = elemento;
        } else if (tipoComparacion === 'años') {
          params.anio = elemento;
        } else if (tipoComparacion === 'meses') {
          params.mes = elemento;
        } else if (tipoComparacion === 'elaboracion') {
          params.tipo_elaboracion = elemento;
        }

        const response = await explorarDatos(params);
        return {
          nombre: elemento,
          valor: response.resumen?.total_toneladas || 0,
          promedio: response.resumen?.promedio_mensual || 0,
          registros: response.resumen?.total_registros || 0
        };
      });

      const resultados = await Promise.all(promesas);
      setDatosComparacion(resultados);
    } catch (error) {
      console.error('Error en comparación:', error);
    } finally {
      setLoading(false);
    }
  };

  // Limpiar comparación
  const limpiarComparacion = () => {
    setElementosComparar([]);
    setDatosComparacion([]);
  };

  const mesesNombres = {
    '1': 'Enero', '2': 'Febrero', '3': 'Marzo', '4': 'Abril',
    '5': 'Mayo', '6': 'Junio', '7': 'Julio', '8': 'Agosto',
    '9': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
  };

  const getOpcionesSegunTipo = () => {
    switch (tipoComparacion) {
      case 'especies':
        return opcionesDisponibles.especies;
      case 'años':
        return opcionesDisponibles.años;
      case 'meses':
        return Object.keys(mesesNombres);
      case 'elaboracion':
        return opcionesDisponibles.tiposElaboracion;
      default:
        return [];
    }
  };

  const formatearNombre = (nombre) => {
    if (tipoComparacion === 'meses') {
      return mesesNombres[nombre] || nombre;
    }
    return nombre;
  };

  return (
    <div className="comparador-datos">
      <div className="section-header">
        <h2>📊 Comparador de Datos</h2>
        <p className="section-description">
          Compara múltiples variables y visualiza diferencias
        </p>
      </div>

      {/* Configuración de Comparación */}
      <div className="comparacion-config">
        <div className="config-row">
          {/* Selector de Dataset con botones */}
          <div className="config-section">
            <label>Paso 1: Selecciona el Dataset</label>
            <div className="dataset-buttons-group">
              <button 
                className={`dataset-btn ${dataset === 'cosecha' ? 'active' : ''}`}
                onClick={() => {
                  setDataset('cosecha');
                  limpiarComparacion();
                }}
              >
                🎣 Cosechas
              </button>
              <button 
                className={`dataset-btn ${dataset === 'produccion' ? 'active' : ''}`}
                onClick={() => {
                  setDataset('produccion');
                  limpiarComparacion();
                }}
              >
                🏭 Producción
              </button>
              <button 
                className={`dataset-btn ${dataset === 'plantas' ? 'active' : ''}`}
                onClick={() => {
                  setDataset('plantas');
                  limpiarComparacion();
                }}
              >
                🏗️ Plantas
              </button>
            </div>
          </div>

          {/* Tipo de Comparación con botones */}
          <div className="config-section">
            <label>Paso 2: ¿Qué quieres comparar?</label>
            <div className="tipo-buttons-group">
              <button 
                className={`tipo-btn ${tipoComparacion === 'especies' ? 'active' : ''}`}
                onClick={() => {
                  setTipoComparacion('especies');
                  limpiarComparacion();
                }}
              >
                🐟 Especies
              </button>
              <button 
                className={`tipo-btn ${tipoComparacion === 'años' ? 'active' : ''}`}
                onClick={() => {
                  setTipoComparacion('años');
                  limpiarComparacion();
                }}
              >
                📅 Años
              </button>
              <button 
                className={`tipo-btn ${tipoComparacion === 'meses' ? 'active' : ''}`}
                onClick={() => {
                  setTipoComparacion('meses');
                  limpiarComparacion();
                }}
              >
                📆 Meses
              </button>
              {dataset === 'produccion' && (
                <button 
                  className={`tipo-btn ${tipoComparacion === 'elaboracion' ? 'active' : ''}`}
                  onClick={() => {
                    setTipoComparacion('elaboracion');
                    limpiarComparacion();
                  }}
                >
                  ⚙️ Tipo Elaboración
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filtros Globales */}
        <div className="filtros-globales">
          <h4>Paso 3: Filtros Adicionales (Opcional - Se aplican a todas las comparaciones)</h4>
          <div className="filtros-row">
            {tipoComparacion !== 'años' && (
              <div className="filtro-item">
                <label>Año:</label>
                <select 
                  value={filtrosGlobales.año} 
                  onChange={(e) => setFiltrosGlobales({...filtrosGlobales, año: e.target.value})}
                >
                  <option value="">Todos</option>
                  {opcionesDisponibles.años.map(año => (
                    <option key={año} value={año}>{año}</option>
                  ))}
                </select>
              </div>
            )}
            
            {tipoComparacion !== 'meses' && (
              <div className="filtro-item">
                <label>Mes:</label>
                <select 
                  value={filtrosGlobales.mes} 
                  onChange={(e) => setFiltrosGlobales({...filtrosGlobales, mes: e.target.value})}
                >
                  <option value="">Todos</option>
                  {Object.entries(mesesNombres).map(([num, nombre]) => (
                    <option key={num} value={num}>{nombre}</option>
                  ))}
                </select>
              </div>
            )}
            
            {tipoComparacion !== 'especies' && (
              <div className="filtro-item">
                <label>Especie:</label>
                <select 
                  value={filtrosGlobales.especie} 
                  onChange={(e) => setFiltrosGlobales({...filtrosGlobales, especie: e.target.value})}
                >
                  <option value="">Todas</option>
                  {opcionesDisponibles.especies.slice(0, 20).map(esp => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
              </div>
            )}

            {dataset === 'produccion' && tipoComparacion !== 'elaboracion' && (
              <div className="filtro-item">
                <label>Tipo Elaboración:</label>
                <select 
                  value={filtrosGlobales.tipo_elaboracion} 
                  onChange={(e) => setFiltrosGlobales({...filtrosGlobales, tipo_elaboracion: e.target.value})}
                >
                  <option value="">Todos</option>
                  {opcionesDisponibles.tiposElaboracion.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Selector de Elementos a Comparar */}
        <div className="selector-elementos">
          <h4>Paso 4: Selecciona los elementos que quieres comparar</h4>
          <p className="helper-text">💡 Puedes agregar múltiples elementos para compararlos visualmente</p>
          <div className="selector-row">
            <select 
              className="select-elemento"
              onChange={(e) => {
                agregarElemento(e.target.value);
                e.target.value = '';
              }}
              disabled={loading}
            >
              <option value="">➕ Agregar {tipoComparacion} para comparar...</option>
              {getOpcionesSegunTipo().map(opcion => (
                <option 
                  key={opcion} 
                  value={opcion}
                  disabled={elementosComparar.includes(opcion)}
                >
                  {formatearNombre(opcion)} {elementosComparar.includes(opcion) ? '✓' : ''}
                </option>
              ))}
            </select>
            
            <button 
              onClick={limpiarComparacion}
              className="btn-limpiar"
              disabled={elementosComparar.length === 0}
            >
              🗑️ Limpiar Todo
            </button>
          </div>

          {/* Elementos seleccionados */}
          <div className="elementos-seleccionados">
            {elementosComparar.map(elemento => (
              <div key={elemento} className="elemento-chip">
                <span>{formatearNombre(elemento)}</span>
                <button onClick={() => eliminarElemento(elemento)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visualización de Comparación */}
      {loading && <div className="loading">Cargando comparación...</div>}
      
      {!loading && datosComparacion.length > 0 && (
        <div className="resultados-comparacion">
          {/* Gráfico de Barras */}
          <div className="chart-container">
            <h3>📊 Comparación Total de Toneladas</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={datosComparacion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="nombre" 
                  tickFormatter={formatearNombre}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => `${value.toLocaleString('es-CL')} ton`}
                  labelFormatter={formatearNombre}
                />
                <Legend />
                <Bar dataKey="valor" name="Total Toneladas" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tabla de Comparación */}
          <div className="tabla-comparacion">
            <h3>📋 Detalle Comparativo</h3>
            <table>
              <thead>
                <tr>
                  <th>{tipoComparacion === 'especies' ? 'Especie' : 
                       tipoComparacion === 'años' ? 'Año' :
                       tipoComparacion === 'meses' ? 'Mes' : 'Tipo'}</th>
                  <th>Total Toneladas</th>
                  <th>Promedio Mensual</th>
                  <th>Registros</th>
                  <th>% del Total</th>
                </tr>
              </thead>
              <tbody>
                {datosComparacion.map((item, index) => {
                  const totalGeneral = datosComparacion.reduce((sum, d) => sum + d.valor, 0);
                  const porcentaje = totalGeneral > 0 ? ((item.valor / totalGeneral) * 100).toFixed(1) : 0;
                  
                  return (
                    <tr key={index}>
                      <td className="nombre-columna">{formatearNombre(item.nombre)}</td>
                      <td className="valor-columna">{item.valor.toLocaleString('es-CL')}</td>
                      <td>{item.promedio.toLocaleString('es-CL')}</td>
                      <td>{item.registros.toLocaleString('es-CL')}</td>
                      <td>
                        <div className="porcentaje-bar">
                          <div 
                            className="porcentaje-fill" 
                            style={{width: `${porcentaje}%`}}
                          ></div>
                          <span>{porcentaje}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td><strong>TOTAL</strong></td>
                  <td><strong>{datosComparacion.reduce((sum, d) => sum + d.valor, 0).toLocaleString('es-CL')}</strong></td>
                  <td><strong>{(datosComparacion.reduce((sum, d) => sum + d.promedio, 0) / datosComparacion.length).toFixed(0).toLocaleString('es-CL')}</strong></td>
                  <td><strong>{datosComparacion.reduce((sum, d) => sum + d.registros, 0).toLocaleString('es-CL')}</strong></td>
                  <td><strong>100%</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {!loading && datosComparacion.length === 0 && elementosComparar.length > 0 && (
        <div className="no-data-message">
          <p>⚠️ No se encontraron datos para la comparación seleccionada</p>
        </div>
      )}

      {elementosComparar.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>Selecciona elementos para comparar</h3>
          <p>Usa los selectores de arriba para elegir qué elementos quieres comparar visualmente</p>
        </div>
      )}
    </div>
  );
}

export default ComparadorDatos;
