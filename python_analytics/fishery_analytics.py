"""
FisheryAnalytics - Clase de análisis avanzado para datos pesqueros chilenos.

Esta clase proporciona métodos de análisis comparativo y temporal para
datos de capturas, producción industrial y plantas procesadoras.

Author: Barri - Aqua-Data PM
Date: 2025-11-19
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
import json
from datetime import datetime


class FisheryAnalytics:
    """
    Clase principal para análisis de datos pesqueros.
    
    Recibe 3 DataFrames de Pandas y proporciona métodos de análisis
    comparativo listos para ser consumidos por una API REST.
    """
    
    def __init__(
        self, 
        df_desembarque: pd.DataFrame,
        df_produccion: pd.DataFrame,
        df_plantas: pd.DataFrame
    ):
        """
        Inicializa la clase con los 3 datasets principales.
        
        Args:
            df_desembarque: DataFrame con datos de capturas (2000-2024)
                Columnas esperadas: Año, Mes, Región, Puerto, Especie, 
                                   Tipo de agente, Toneladas
            df_produccion: DataFrame con datos de procesamiento (2010-2024)
                Columnas esperadas: Año, Región, Especie, Línea de elaboración,
                                   Materia Prima, Producción
            df_plantas: DataFrame con infraestructura (2010-2024)
                Columnas esperadas: Año, Región, Nombre Planta, Línea de producción
        """
        # Almacenar copias para evitar modificaciones externas
        self.df_desembarque = df_desembarque.copy()
        self.df_produccion = df_produccion.copy()
        self.df_plantas = df_plantas.copy()
        
        # Normalizar nombres de columnas
        self._normalize_dataframes()
        
        # Validar estructura
        self._validate_dataframes()
    
    def _normalize_dataframes(self):
        """Normaliza nombres de columnas y datos para consistencia."""
        # Normalizar nombres de columnas (quitar espacios, minúsculas)
        self.df_desembarque.columns = self.df_desembarque.columns.str.strip()
        self.df_produccion.columns = self.df_produccion.columns.str.strip()
        self.df_plantas.columns = self.df_plantas.columns.str.strip()
        
        # Normalizar regiones (strip y uppercase para consistencia)
        if 'Región' in self.df_desembarque.columns:
            self.df_desembarque['Región'] = self.df_desembarque['Región'].str.strip().str.upper()
        
        if 'Región' in self.df_produccion.columns:
            self.df_produccion['Región'] = self.df_produccion['Región'].str.strip().str.upper()
        
        if 'Región' in self.df_plantas.columns:
            self.df_plantas['Región'] = self.df_plantas['Región'].str.strip().str.upper()
        
        # Normalizar especies
        if 'Especie' in self.df_desembarque.columns:
            self.df_desembarque['Especie'] = self.df_desembarque['Especie'].str.strip().str.upper()
        
        if 'Especie' in self.df_produccion.columns:
            self.df_produccion['Especie'] = self.df_produccion['Especie'].str.strip().str.upper()
    
    def _validate_dataframes(self):
        """Valida que los DataFrames tengan las columnas mínimas requeridas."""
        required_desembarque = ['Año', 'Especie', 'Toneladas']
        required_produccion = ['Año', 'Especie', 'Materia Prima', 'Producción']
        required_plantas = ['Año', 'Región', 'Nombre Planta']
        
        for col in required_desembarque:
            if col not in self.df_desembarque.columns:
                raise ValueError(f"Columna '{col}' faltante en df_desembarque")
        
        for col in required_produccion:
            if col not in self.df_produccion.columns:
                raise ValueError(f"Columna '{col}' faltante en df_produccion")
        
        for col in required_plantas:
            if col not in self.df_plantas.columns:
                raise ValueError(f"Columna '{col}' faltante en df_plantas")
    
    def _to_serializable(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """
        Convierte un DataFrame a una lista de diccionarios JSON-serializable.
        
        Args:
            df: DataFrame de Pandas
            
        Returns:
            Lista de diccionarios listos para JSON
        """
        # Reemplazar NaN/None con None para JSON
        df = df.replace({np.nan: None, pd.NaT: None})
        
        # Convertir a registros
        return df.to_dict('records')
    
    def get_supply_vs_demand(
        self, 
        start_year: int = 2010,
        end_year: Optional[int] = None,
        region: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Comparación Oferta vs Demanda: Capturas vs Materia Prima Industrial.
        
        Analiza la diferencia entre lo capturado (oferta) y lo procesado
        (demanda industrial) por año y especie.
        
        Args:
            start_year: Año inicial de análisis (default: 2010)
            end_year: Año final (default: último año disponible)
            region: Filtro opcional por región
            
        Returns:
            Dict con estructura:
            {
                'metadata': {...},
                'data': [{'Año', 'Especie', 'Capturas', 'Materia_Prima', 'Delta', 'Porcentaje_Utilizado'}],
                'summary': {...}
            }
        """
        if end_year is None:
            end_year = self.df_desembarque['Año'].max()
        
        # Filtrar desembarques por año
        df_capturas = self.df_desembarque[
            (self.df_desembarque['Año'] >= start_year) & 
            (self.df_desembarque['Año'] <= end_year)
        ].copy()
        
        # Filtrar producción por año
        df_prod = self.df_produccion[
            (self.df_produccion['Año'] >= start_year) & 
            (self.df_produccion['Año'] <= end_year)
        ].copy()
        
        # Filtro regional si se especifica
        if region:
            region_upper = region.strip().upper()
            if 'Región' in df_capturas.columns:
                df_capturas = df_capturas[df_capturas['Región'] == region_upper]
            if 'Región' in df_prod.columns:
                df_prod = df_prod[df_prod['Región'] == region_upper]
        
        # Agrupar capturas por Año y Especie
        capturas_agg = df_capturas.groupby(['Año', 'Especie'], as_index=False).agg({
            'Toneladas': 'sum'
        }).rename(columns={'Toneladas': 'Capturas'})
        
        # Agrupar producción por Año y Especie
        produccion_agg = df_prod.groupby(['Año', 'Especie'], as_index=False).agg({
            'Materia Prima': 'sum'
        })
        
        # Merge para comparar
        comparison = pd.merge(
            capturas_agg,
            produccion_agg,
            on=['Año', 'Especie'],
            how='outer'
        ).fillna(0)
        
        # Calcular delta y porcentaje
        comparison['Delta'] = comparison['Capturas'] - comparison['Materia Prima']
        comparison['Porcentaje_Utilizado'] = np.where(
            comparison['Capturas'] > 0,
            (comparison['Materia Prima'] / comparison['Capturas'] * 100).round(2),
            0
        )
        
        # Ordenar por año y capturas
        comparison = comparison.sort_values(['Año', 'Capturas'], ascending=[True, False])
        
        # Redondear valores
        comparison['Capturas'] = comparison['Capturas'].round(2)
        comparison['Materia Prima'] = comparison['Materia Prima'].round(2)
        comparison['Delta'] = comparison['Delta'].round(2)
        
        # Calcular resumen
        summary = {
            'total_capturas': float(comparison['Capturas'].sum()),
            'total_materia_prima': float(comparison['Materia Prima'].sum()),
            'delta_total': float(comparison['Delta'].sum()),
            'porcentaje_utilizado_promedio': float(comparison['Porcentaje_Utilizado'].mean()),
            'especies_analizadas': int(comparison['Especie'].nunique()),
            'años_analizados': int(comparison['Año'].nunique())
        }
        
        return {
            'success': True,
            'analysis_type': 'supply_vs_demand',
            'metadata': {
                'start_year': start_year,
                'end_year': end_year,
                'region': region,
                'generated_at': datetime.now().isoformat()
            },
            'data': self._to_serializable(comparison),
            'summary': summary
        }
    
    def get_conversion_efficiency(
        self,
        top_n: int = 20,
        min_materia_prima: float = 100.0
    ) -> Dict[str, Any]:
        """
        Eficiencia de Conversión: Rendimiento Industrial por Especie y Línea.
        
        Calcula el yield (rendimiento) de conversión de materia prima a producto
        final para cada combinación de especie y línea de elaboración.
        
        Args:
            top_n: Número de resultados a retornar (default: 20)
            min_materia_prima: Mínimo de materia prima para incluir (filtro de ruido)
            
        Returns:
            Dict con estructura:
            {
                'metadata': {...},
                'data': [{'Especie', 'Linea_Elaboracion', 'Materia_Prima', 'Produccion', 'Yield'}],
                'summary': {...}
            }
        """
        # Agrupar por Especie y Línea de elaboración
        efficiency = self.df_produccion.groupby(
            ['Especie', 'Línea de elaboración'], 
            as_index=False
        ).agg({
            'Materia Prima': 'sum',
            'Producción': 'sum'
        })
        
        # Filtrar por mínimo de materia prima
        efficiency = efficiency[efficiency['Materia Prima'] >= min_materia_prima]
        
        # Calcular rendimiento (Yield)
        efficiency['Yield'] = (
            (efficiency['Producción'] / efficiency['Materia Prima']) * 100
        ).round(2)
        
        # Ordenar por rendimiento descendente
        efficiency = efficiency.sort_values('Yield', ascending=False).head(top_n)
        
        # Renombrar columnas para JSON
        efficiency = efficiency.rename(columns={
            'Línea de elaboración': 'Linea_Elaboracion',
            'Materia Prima': 'Materia_Prima',
            'Producción': 'Produccion'
        })
        
        # Redondear valores
        efficiency['Materia_Prima'] = efficiency['Materia_Prima'].round(2)
        efficiency['Produccion'] = efficiency['Produccion'].round(2)
        
        # Calcular resumen
        summary = {
            'yield_promedio': float(efficiency['Yield'].mean()),
            'yield_maximo': float(efficiency['Yield'].max()),
            'yield_minimo': float(efficiency['Yield'].min()),
            'combinaciones_analizadas': len(efficiency),
            'especies_unicas': int(efficiency['Especie'].nunique())
        }
        
        return {
            'success': True,
            'analysis_type': 'conversion_efficiency',
            'metadata': {
                'top_n': top_n,
                'min_materia_prima': min_materia_prima,
                'generated_at': datetime.now().isoformat()
            },
            'data': self._to_serializable(efficiency),
            'summary': summary
        }
    
    def get_regional_dynamics(self) -> Dict[str, Any]:
        """
        Dinámica Regional: Comparación Extractiva vs Productiva por Región.
        
        Compara el volumen de capturas (actividad extractiva) con el volumen
        de producción industrial (actividad productiva) para cada región.
        
        Returns:
            Dict con estructura:
            {
                'metadata': {...},
                'data': [{'Region', 'Capturas_Totales', 'Produccion_Total', 'Ratio_Prod_Captura'}],
                'summary': {...}
            }
        """
        # Agrupar capturas por región
        if 'Región' not in self.df_desembarque.columns:
            return {
                'success': False,
                'error': 'Columna Región no disponible en df_desembarque'
            }
        
        capturas_regional = self.df_desembarque.groupby('Región', as_index=False).agg({
            'Toneladas': 'sum'
        }).rename(columns={'Toneladas': 'Capturas_Totales'})
        
        # Agrupar producción por región
        if 'Región' not in self.df_produccion.columns:
            return {
                'success': False,
                'error': 'Columna Región no disponible en df_produccion'
            }
        
        produccion_regional = self.df_produccion.groupby('Región', as_index=False).agg({
            'Producción': 'sum'
        }).rename(columns={'Producción': 'Produccion_Total'})
        
        # Merge por región
        dynamics = pd.merge(
            capturas_regional,
            produccion_regional,
            on='Región',
            how='outer'
        ).fillna(0)
        
        # Calcular ratio
        dynamics['Ratio_Prod_Captura'] = np.where(
            dynamics['Capturas_Totales'] > 0,
            (dynamics['Produccion_Total'] / dynamics['Capturas_Totales']).round(4),
            0
        )
        
        # Ordenar por capturas descendente
        dynamics = dynamics.sort_values('Capturas_Totales', ascending=False)
        
        # Redondear valores
        dynamics['Capturas_Totales'] = dynamics['Capturas_Totales'].round(2)
        dynamics['Produccion_Total'] = dynamics['Produccion_Total'].round(2)
        
        # Renombrar región
        dynamics = dynamics.rename(columns={'Región': 'Region'})
        
        # Calcular resumen
        summary = {
            'total_capturas_nacional': float(dynamics['Capturas_Totales'].sum()),
            'total_produccion_nacional': float(dynamics['Produccion_Total'].sum()),
            'regiones_analizadas': len(dynamics),
            'region_mayor_captura': dynamics.iloc[0]['Region'] if len(dynamics) > 0 else None,
            'region_mayor_produccion': dynamics.sort_values('Produccion_Total', ascending=False).iloc[0]['Region'] if len(dynamics) > 0 else None
        }
        
        return {
            'success': True,
            'analysis_type': 'regional_dynamics',
            'metadata': {
                'generated_at': datetime.now().isoformat()
            },
            'data': self._to_serializable(dynamics),
            'summary': summary
        }
    
    def get_longitudinal_evolution(self) -> Dict[str, Any]:
        """
        Evolución Temporal: Capturas y Plantas a lo largo del tiempo.
        
        Analiza la evolución de capturas totales (2000-2024) y el número
        de plantas únicas (2010-2024) año por año.
        
        Returns:
            Dict con estructura:
            {
                'metadata': {...},
                'data': [{'Año', 'Capturas_Totales', 'Num_Plantas'}],
                'summary': {...}
            }
        """
        # Serie temporal de capturas (desde 2000)
        capturas_temporal = self.df_desembarque.groupby('Año', as_index=False).agg({
            'Toneladas': 'sum'
        }).rename(columns={'Toneladas': 'Capturas_Totales'})
        
        # Serie temporal de plantas únicas (desde 2010)
        plantas_temporal = self.df_plantas.groupby('Año', as_index=False).agg({
            'Nombre Planta': 'nunique'
        }).rename(columns={'Nombre Planta': 'Num_Plantas'})
        
        # Merge temporal (outer para incluir todos los años)
        evolution = pd.merge(
            capturas_temporal,
            plantas_temporal,
            on='Año',
            how='outer'
        ).fillna(0)
        
        # Ordenar por año
        evolution = evolution.sort_values('Año')
        
        # Convertir Num_Plantas a entero
        evolution['Num_Plantas'] = evolution['Num_Plantas'].astype(int)
        
        # Redondear capturas
        evolution['Capturas_Totales'] = evolution['Capturas_Totales'].round(2)
        
        # Calcular tasas de crecimiento
        evolution['Capturas_Variacion_Pct'] = evolution['Capturas_Totales'].pct_change() * 100
        evolution['Plantas_Variacion_Pct'] = evolution['Num_Plantas'].pct_change() * 100
        
        # Redondear variaciones
        evolution['Capturas_Variacion_Pct'] = evolution['Capturas_Variacion_Pct'].round(2)
        evolution['Plantas_Variacion_Pct'] = evolution['Plantas_Variacion_Pct'].round(2)
        
        # Reemplazar infinitos y NaN en variaciones
        evolution = evolution.replace([np.inf, -np.inf], None)
        
        # Calcular resumen
        summary = {
            'años_totales': len(evolution),
            'año_minimo': int(evolution['Año'].min()),
            'año_maximo': int(evolution['Año'].max()),
            'capturas_año_pico': int(evolution.loc[evolution['Capturas_Totales'].idxmax(), 'Año']) if len(evolution) > 0 else None,
            'capturas_maximas': float(evolution['Capturas_Totales'].max()),
            'plantas_año_pico': int(evolution.loc[evolution['Num_Plantas'].idxmax(), 'Año']) if evolution['Num_Plantas'].max() > 0 else None,
            'plantas_maximas': int(evolution['Num_Plantas'].max()),
            'tasa_crecimiento_capturas_promedio': float(evolution['Capturas_Variacion_Pct'].mean()) if not evolution['Capturas_Variacion_Pct'].isna().all() else 0
        }
        
        return {
            'success': True,
            'analysis_type': 'longitudinal_evolution',
            'metadata': {
                'generated_at': datetime.now().isoformat()
            },
            'data': self._to_serializable(evolution),
            'summary': summary
        }
    
    def get_agent_share(self) -> Dict[str, Any]:
        """
        Comparación por Tipo de Agente: Participación por Región.
        
        Crea una tabla pivote mostrando las toneladas capturadas por
        cada tipo de agente en cada región.
        
        Returns:
            Dict con estructura:
            {
                'metadata': {...},
                'data': [{'Region', 'Artesanal', 'Industrial', ...}],
                'summary': {...}
            }
        """
        if 'Tipo de agente' not in self.df_desembarque.columns:
            return {
                'success': False,
                'error': 'Columna "Tipo de agente" no disponible en df_desembarque'
            }
        
        if 'Región' not in self.df_desembarque.columns:
            return {
                'success': False,
                'error': 'Columna "Región" no disponible en df_desembarque'
            }
        
        # Crear tabla pivote
        pivot_agents = self.df_desembarque.pivot_table(
            index='Región',
            columns='Tipo de agente',
            values='Toneladas',
            aggfunc='sum',
            fill_value=0
        ).reset_index()
        
        # Renombrar columna de región
        pivot_agents = pivot_agents.rename(columns={'Región': 'Region'})
        
        # Calcular total por región
        agent_columns = [col for col in pivot_agents.columns if col != 'Region']
        pivot_agents['Total'] = pivot_agents[agent_columns].sum(axis=1)
        
        # Calcular porcentajes
        for col in agent_columns:
            pivot_agents[f'{col}_Pct'] = np.where(
                pivot_agents['Total'] > 0,
                (pivot_agents[col] / pivot_agents['Total'] * 100).round(2),
                0
            )
        
        # Ordenar por total descendente
        pivot_agents = pivot_agents.sort_values('Total', ascending=False)
        
        # Redondear valores
        for col in agent_columns + ['Total']:
            pivot_agents[col] = pivot_agents[col].round(2)
        
        # Calcular resumen
        summary = {
            'regiones_analizadas': len(pivot_agents),
            'tipos_agente': agent_columns,
            'total_nacional': float(pivot_agents['Total'].sum()),
            'participacion_por_tipo': {
                agente: float(pivot_agents[agente].sum())
                for agente in agent_columns
            }
        }
        
        return {
            'success': True,
            'analysis_type': 'agent_share',
            'metadata': {
                'generated_at': datetime.now().isoformat()
            },
            'data': self._to_serializable(pivot_agents),
            'summary': summary
        }
    
    def get_plant_capacity_analysis(self) -> Dict[str, Any]:
        """
        Capacidad vs Producción: Productividad por Planta.
        
        Analiza la relación entre el número de plantas activas y el volumen
        de producción para calcular la productividad promedio por planta.
        
        Returns:
            Dict con estructura:
            {
                'metadata': {...},
                'data': [{'Año', 'Region', 'Num_Plantas', 'Produccion_Total', 'Promedio_Por_Planta'}],
                'summary': {...}
            }
        """
        # Contar plantas únicas por Región y Año
        plantas_count = self.df_plantas.groupby(['Año', 'Región'], as_index=False).agg({
            'Nombre Planta': 'nunique'
        }).rename(columns={'Nombre Planta': 'Num_Plantas'})
        
        # Sumar producción por Región y Año
        produccion_total = self.df_produccion.groupby(['Año', 'Región'], as_index=False).agg({
            'Producción': 'sum'
        }).rename(columns={'Producción': 'Produccion_Total'})
        
        # Merge por Año y Región
        capacity_analysis = pd.merge(
            plantas_count,
            produccion_total,
            on=['Año', 'Región'],
            how='outer'
        ).fillna(0)
        
        # Calcular promedio de producción por planta
        capacity_analysis['Promedio_Por_Planta'] = np.where(
            capacity_analysis['Num_Plantas'] > 0,
            (capacity_analysis['Produccion_Total'] / capacity_analysis['Num_Plantas']).round(2),
            0
        )
        
        # Convertir Num_Plantas a entero
        capacity_analysis['Num_Plantas'] = capacity_analysis['Num_Plantas'].astype(int)
        
        # Redondear producción
        capacity_analysis['Produccion_Total'] = capacity_analysis['Produccion_Total'].round(2)
        
        # Renombrar región
        capacity_analysis = capacity_analysis.rename(columns={'Región': 'Region'})
        
        # Ordenar por año y producción
        capacity_analysis = capacity_analysis.sort_values(['Año', 'Produccion_Total'], ascending=[True, False])
        
        # Calcular resumen
        summary = {
            'años_analizados': int(capacity_analysis['Año'].nunique()),
            'regiones_analizadas': int(capacity_analysis['Region'].nunique()),
            'total_plantas_maximas': int(capacity_analysis['Num_Plantas'].max()),
            'produccion_total_periodo': float(capacity_analysis['Produccion_Total'].sum()),
            'promedio_productividad': float(capacity_analysis['Promedio_Por_Planta'].mean()),
            'region_mas_productiva': capacity_analysis.sort_values('Promedio_Por_Planta', ascending=False).iloc[0]['Region'] if len(capacity_analysis) > 0 else None
        }
        
        return {
            'success': True,
            'analysis_type': 'plant_capacity_analysis',
            'metadata': {
                'generated_at': datetime.now().isoformat()
            },
            'data': self._to_serializable(capacity_analysis),
            'summary': summary
        }
    
    def export_all_analyses(self, output_format: str = 'json') -> Dict[str, Any]:
        """
        Ejecuta todos los análisis y retorna un diccionario completo.
        
        Args:
            output_format: Formato de salida ('json' o 'dict')
            
        Returns:
            Dict con todos los análisis
        """
        all_analyses = {
            'generated_at': datetime.now().isoformat(),
            'supply_vs_demand': self.get_supply_vs_demand(),
            'conversion_efficiency': self.get_conversion_efficiency(),
            'regional_dynamics': self.get_regional_dynamics(),
            'longitudinal_evolution': self.get_longitudinal_evolution(),
            'agent_share': self.get_agent_share(),
            'plant_capacity_analysis': self.get_plant_capacity_analysis()
        }
        
        if output_format == 'json':
            return json.dumps(all_analyses, indent=2, ensure_ascii=False)
        
        return all_analyses


# Función helper para cargar datos desde CSV
def load_fishery_data(
    desembarque_path: str,
    produccion_path: str,
    plantas_path: str
) -> FisheryAnalytics:
    """
    Carga los 3 datasets desde archivos CSV y retorna una instancia de FisheryAnalytics.
    
    Args:
        desembarque_path: Ruta al CSV de desembarques
        produccion_path: Ruta al CSV de producción
        plantas_path: Ruta al CSV de plantas
        
    Returns:
        Instancia de FisheryAnalytics lista para usar
    """
    df_desembarque = pd.read_csv(desembarque_path, encoding='utf-8')
    df_produccion = pd.read_csv(produccion_path, encoding='utf-8')
    df_plantas = pd.read_csv(plantas_path, encoding='utf-8')
    
    return FisheryAnalytics(df_desembarque, df_produccion, df_plantas)
