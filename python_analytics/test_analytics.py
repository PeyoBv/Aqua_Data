"""
Tests unitarios para FisheryAnalytics.

Valida el correcto funcionamiento de todos los métodos de análisis.
"""

import unittest
import pandas as pd
import numpy as np
from fishery_analytics import FisheryAnalytics


class TestFisheryAnalytics(unittest.TestCase):
    """Suite de tests para FisheryAnalytics."""
    
    def setUp(self):
        """Configuración inicial para cada test."""
        # Datos de prueba
        self.df_desembarque = pd.DataFrame({
            'Año': [2020, 2020, 2021, 2021, 2022, 2022],
            'Mes': [1, 2, 1, 2, 1, 2],
            'Región': ['LAGOS', 'AYSEN', 'LAGOS', 'MAGALLANES', 'LAGOS', 'AYSEN'],
            'Puerto': ['Puerto Montt', 'Chacabuco', 'Puerto Montt', 'Punta Arenas', 'Puerto Montt', 'Chacabuco'],
            'Especie': ['SALMON', 'MERLUZA', 'SALMON', 'CENTOLLA', 'SALMON', 'MERLUZA'],
            'Tipo de agente': ['Industrial', 'Artesanal', 'Industrial', 'Artesanal', 'Industrial', 'Artesanal'],
            'Toneladas': [1000, 500, 1200, 300, 1100, 550]
        })
        
        self.df_produccion = pd.DataFrame({
            'Año': [2020, 2020, 2021, 2021, 2022],
            'Región': ['LAGOS', 'AYSEN', 'LAGOS', 'MAGALLANES', 'LAGOS'],
            'Especie': ['SALMON', 'MERLUZA', 'SALMON', 'CENTOLLA', 'SALMON'],
            'Línea de elaboración': ['Congelado', 'Fresco', 'Congelado', 'Cocido', 'Congelado'],
            'Materia Prima': [800, 400, 900, 250, 850],
            'Producción': [700, 350, 800, 200, 750]
        })
        
        self.df_plantas = pd.DataFrame({
            'Año': [2020, 2020, 2021, 2021, 2022, 2022],
            'Región': ['LAGOS', 'LAGOS', 'LAGOS', 'AYSEN', 'LAGOS', 'AYSEN'],
            'Nombre Planta': ['Planta A', 'Planta B', 'Planta A', 'Planta C', 'Planta A', 'Planta C'],
            'Línea de producción': ['Congelado', 'Fresco', 'Congelado', 'Fresco', 'Congelado', 'Fresco']
        })
        
        self.analytics = FisheryAnalytics(
            self.df_desembarque,
            self.df_produccion,
            self.df_plantas
        )
    
    def test_initialization(self):
        """Test que la clase se inicializa correctamente."""
        self.assertIsNotNone(self.analytics.df_desembarque)
        self.assertIsNotNone(self.analytics.df_produccion)
        self.assertIsNotNone(self.analytics.df_plantas)
    
    def test_supply_vs_demand(self):
        """Test del método get_supply_vs_demand."""
        result = self.analytics.get_supply_vs_demand(start_year=2020)
        
        self.assertTrue(result['success'])
        self.assertEqual(result['analysis_type'], 'supply_vs_demand')
        self.assertIn('data', result)
        self.assertIn('summary', result)
        self.assertIn('metadata', result)
        
        # Validar estructura de datos
        self.assertIsInstance(result['data'], list)
        if len(result['data']) > 0:
            self.assertIn('Año', result['data'][0])
            self.assertIn('Especie', result['data'][0])
            self.assertIn('Delta', result['data'][0])
    
    def test_conversion_efficiency(self):
        """Test del método get_conversion_efficiency."""
        result = self.analytics.get_conversion_efficiency(top_n=10)
        
        self.assertTrue(result['success'])
        self.assertEqual(result['analysis_type'], 'conversion_efficiency')
        self.assertIn('data', result)
        self.assertIn('summary', result)
        
        # Validar que el yield está en rango válido
        for record in result['data']:
            self.assertIn('Yield', record)
            self.assertGreaterEqual(record['Yield'], 0)
            self.assertLessEqual(record['Yield'], 100)
    
    def test_regional_dynamics(self):
        """Test del método get_regional_dynamics."""
        result = self.analytics.get_regional_dynamics()
        
        self.assertTrue(result['success'])
        self.assertEqual(result['analysis_type'], 'regional_dynamics')
        self.assertIn('data', result)
        self.assertIn('summary', result)
        
        # Validar que hay datos por región
        self.assertGreater(len(result['data']), 0)
    
    def test_longitudinal_evolution(self):
        """Test del método get_longitudinal_evolution."""
        result = self.analytics.get_longitudinal_evolution()
        
        self.assertTrue(result['success'])
        self.assertEqual(result['analysis_type'], 'longitudinal_evolution')
        self.assertIn('data', result)
        
        # Validar que los datos están ordenados por año
        years = [record['Año'] for record in result['data']]
        self.assertEqual(years, sorted(years))
    
    def test_agent_share(self):
        """Test del método get_agent_share."""
        result = self.analytics.get_agent_share()
        
        self.assertTrue(result['success'])
        self.assertEqual(result['analysis_type'], 'agent_share')
        self.assertIn('data', result)
        self.assertIn('summary', result)
    
    def test_plant_capacity_analysis(self):
        """Test del método get_plant_capacity_analysis."""
        result = self.analytics.get_plant_capacity_analysis()
        
        self.assertTrue(result['success'])
        self.assertEqual(result['analysis_type'], 'plant_capacity_analysis')
        self.assertIn('data', result)
        
        # Validar que el promedio por planta es correcto
        for record in result['data']:
            if record['Num_Plantas'] > 0:
                expected = record['Produccion_Total'] / record['Num_Plantas']
                self.assertAlmostEqual(record['Promedio_Por_Planta'], expected, places=2)
    
    def test_export_all_analyses(self):
        """Test del método export_all_analyses."""
        result = self.analytics.export_all_analyses(output_format='dict')
        
        self.assertIn('supply_vs_demand', result)
        self.assertIn('conversion_efficiency', result)
        self.assertIn('regional_dynamics', result)
        self.assertIn('longitudinal_evolution', result)
        self.assertIn('agent_share', result)
        self.assertIn('plant_capacity_analysis', result)
        
        # Validar que todos retornan success=True
        for key in result.keys():
            if key != 'generated_at':
                self.assertTrue(result[key]['success'])
    
    def test_invalid_dataframe(self):
        """Test que valida el manejo de DataFrames inválidos."""
        df_invalid = pd.DataFrame({'col1': [1, 2, 3]})
        
        with self.assertRaises(ValueError):
            FisheryAnalytics(df_invalid, self.df_produccion, self.df_plantas)
    
    def test_regional_filter(self):
        """Test de filtros regionales."""
        result = self.analytics.get_supply_vs_demand(start_year=2020, region='LAGOS')
        
        self.assertTrue(result['success'])
        self.assertEqual(result['metadata']['region'], 'LAGOS')


if __name__ == '__main__':
    print("=" * 80)
    print("EJECUTANDO TESTS UNITARIOS - FISHERY ANALYTICS")
    print("=" * 80)
    print()
    
    # Ejecutar tests
    unittest.main(verbosity=2)
