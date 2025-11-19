"""
Script de ejemplo de uso de FisheryAnalytics.

Demuestra cómo usar la clase con datos reales y cómo
integrarla con una API REST.
"""

import sys
import os
import pandas as pd
import json

# Agregar path para imports
sys.path.append(os.path.dirname(__file__))

from fishery_analytics import FisheryAnalytics, load_fishery_data


def example_basic_usage():
    """Ejemplo básico de uso con DataFrames simulados."""
    print("=" * 80)
    print("EJEMPLO 1: Uso Básico con DataFrames Simulados")
    print("=" * 80)
    
    # Crear datos de ejemplo
    df_desembarque = pd.DataFrame({
        'Año': [2020, 2020, 2021, 2021, 2022],
        'Mes': [1, 2, 1, 2, 1],
        'Región': ['LAGOS', 'AYSEN', 'LAGOS', 'MAGALLANES', 'LAGOS'],
        'Puerto': ['Puerto Montt', 'Chacabuco', 'Puerto Montt', 'Punta Arenas', 'Puerto Montt'],
        'Especie': ['SALMON', 'MERLUZA', 'SALMON', 'CENTOLLA', 'SALMON'],
        'Tipo de agente': ['Industrial', 'Artesanal', 'Industrial', 'Artesanal', 'Industrial'],
        'Toneladas': [1000, 500, 1200, 300, 1100]
    })
    
    df_produccion = pd.DataFrame({
        'Año': [2020, 2020, 2021, 2021],
        'Región': ['LAGOS', 'AYSEN', 'LAGOS', 'MAGALLANES'],
        'Especie': ['SALMON', 'MERLUZA', 'SALMON', 'CENTOLLA'],
        'Línea de elaboración': ['Congelado', 'Fresco', 'Congelado', 'Cocido'],
        'Materia Prima': [800, 400, 900, 250],
        'Producción': [700, 350, 800, 200]
    })
    
    df_plantas = pd.DataFrame({
        'Año': [2020, 2020, 2021, 2021, 2022],
        'Región': ['LAGOS', 'LAGOS', 'LAGOS', 'AYSEN', 'LAGOS'],
        'Nombre Planta': ['Planta A', 'Planta B', 'Planta A', 'Planta C', 'Planta A'],
        'Línea de producción': ['Congelado', 'Fresco', 'Congelado', 'Fresco', 'Congelado']
    })
    
    # Crear instancia del analizador
    analytics = FisheryAnalytics(df_desembarque, df_produccion, df_plantas)
    
    # Ejecutar análisis
    print("\n1. OFERTA VS DEMANDA:")
    print("-" * 80)
    result = analytics.get_supply_vs_demand(start_year=2020)
    print(json.dumps(result['summary'], indent=2))
    print(f"Registros: {len(result['data'])}")
    
    print("\n2. EFICIENCIA DE CONVERSIÓN:")
    print("-" * 80)
    result = analytics.get_conversion_efficiency(top_n=5)
    print(json.dumps(result['summary'], indent=2))
    for record in result['data']:
        print(f"  {record['Especie']} - {record['Linea_Elaboracion']}: {record['Yield']}%")
    
    print("\n3. DINÁMICA REGIONAL:")
    print("-" * 80)
    result = analytics.get_regional_dynamics()
    print(json.dumps(result['summary'], indent=2))
    
    print("\n4. EVOLUCIÓN TEMPORAL:")
    print("-" * 80)
    result = analytics.get_longitudinal_evolution()
    print(json.dumps(result['summary'], indent=2))
    
    print("\n5. PARTICIPACIÓN POR AGENTE:")
    print("-" * 80)
    result = analytics.get_agent_share()
    if result['success']:
        print(json.dumps(result['summary'], indent=2))
    
    print("\n6. ANÁLISIS DE CAPACIDAD:")
    print("-" * 80)
    result = analytics.get_plant_capacity_analysis()
    print(json.dumps(result['summary'], indent=2))
    
    print("\n✅ Todos los análisis completados exitosamente!\n")


def example_with_real_data():
    """Ejemplo con datos reales desde CSV (si están disponibles)."""
    print("=" * 80)
    print("EJEMPLO 2: Uso con Datos Reales desde CSV")
    print("=" * 80)
    
    # Rutas a los archivos CSV
    base_path = os.path.join(os.path.dirname(__file__), '..', 'data')
    
    desembarque_csv = os.path.join(base_path, 'DESEMBARQUES_2000_2024.csv')
    produccion_csv = os.path.join(base_path, 'PRODUCCION_MATERIA_PRIMA_2010_2024.csv')
    plantas_csv = os.path.join(base_path, 'PLANTAS_INDUSTRIALES_2010_2024.csv')
    
    # Verificar que los archivos existan
    if not all(os.path.exists(f) for f in [desembarque_csv, produccion_csv, plantas_csv]):
        print("⚠️  Archivos CSV no encontrados. Asegúrate de que estén en la carpeta 'data/'")
        print(f"   Buscando en: {base_path}")
        return
    
    try:
        # Cargar datos
        print("Cargando datos desde CSV...")
        analytics = load_fishery_data(desembarque_csv, produccion_csv, plantas_csv)
        print(f"✅ Datos cargados exitosamente!")
        
        # Análisis completo de Región de Los Lagos
        print("\n" + "=" * 80)
        print("ANÁLISIS DETALLADO: REGIÓN DE LOS LAGOS")
        print("=" * 80)
        
        # Oferta vs Demanda filtrado por región
        print("\n📊 Oferta vs Demanda (2015-2024):")
        result = analytics.get_supply_vs_demand(start_year=2015, region='LAGOS')
        print(f"   Total Capturas: {result['summary']['total_capturas']:,.0f} toneladas")
        print(f"   Total Materia Prima: {result['summary']['total_materia_prima']:,.0f} toneladas")
        print(f"   % Utilizado: {result['summary']['porcentaje_utilizado_promedio']:.1f}%")
        
        # Top 10 especies por eficiencia
        print("\n🏆 Top 10 Especies por Eficiencia de Conversión:")
        result = analytics.get_conversion_efficiency(top_n=10, min_materia_prima=1000)
        for i, record in enumerate(result['data'][:10], 1):
            print(f"   {i}. {record['Especie'][:30]:30} | Yield: {record['Yield']:6.2f}%")
        
        # Evolución temporal
        print("\n📈 Evolución Temporal (últimos 5 años):")
        result = analytics.get_longitudinal_evolution()
        recent_data = [d for d in result['data'] if d['Año'] >= 2019]
        for record in recent_data:
            print(f"   {record['Año']}: {record['Capturas_Totales']:>10,.0f} ton | {record['Num_Plantas']:>3} plantas")
        
        # Exportar todos los análisis
        print("\n💾 Exportando todos los análisis a JSON...")
        all_results = analytics.export_all_analyses(output_format='dict')
        
        output_file = os.path.join(os.path.dirname(__file__), 'fishery_analysis_results.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_results, f, indent=2, ensure_ascii=False)
        
        print(f"   ✅ Resultados guardados en: {output_file}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()


def example_api_integration():
    """Ejemplo de cómo integrar con FastAPI o Flask."""
    print("=" * 80)
    print("EJEMPLO 3: Integración con API REST")
    print("=" * 80)
    
    api_code = """
# Ejemplo con FastAPI
from fastapi import FastAPI, Query
from typing import Optional
import pandas as pd
from fishery_analytics import FisheryAnalytics

app = FastAPI(title="Fishery Analytics API")

# Cargar datos al iniciar (singleton)
df_desembarque = pd.read_csv('data/DESEMBARQUES_2000_2024.csv')
df_produccion = pd.read_csv('data/PRODUCCION_MATERIA_PRIMA_2010_2024.csv')
df_plantas = pd.read_csv('data/PLANTAS_INDUSTRIALES_2010_2024.csv')

analytics = FisheryAnalytics(df_desembarque, df_produccion, df_plantas)

@app.get("/api/analysis/supply-demand")
async def supply_demand(
    start_year: int = Query(2010, ge=2000, le=2024),
    end_year: Optional[int] = None,
    region: Optional[str] = None
):
    return analytics.get_supply_vs_demand(start_year, end_year, region)

@app.get("/api/analysis/efficiency")
async def efficiency(top_n: int = Query(20, ge=1, le=100)):
    return analytics.get_conversion_efficiency(top_n=top_n)

@app.get("/api/analysis/regional")
async def regional():
    return analytics.get_regional_dynamics()

@app.get("/api/analysis/evolution")
async def evolution():
    return analytics.get_longitudinal_evolution()

@app.get("/api/analysis/agents")
async def agents():
    return analytics.get_agent_share()

@app.get("/api/analysis/capacity")
async def capacity():
    return analytics.get_plant_capacity_analysis()

@app.get("/api/analysis/all")
async def all_analyses():
    return analytics.export_all_analyses(output_format='dict')

# Para ejecutar: uvicorn api:app --reload
"""
    
    print(api_code)
    print("\n✅ Código de ejemplo generado. Guárdalo como 'api.py' y ejecuta:")
    print("   pip install fastapi uvicorn")
    print("   uvicorn api:app --reload")
    print()


if __name__ == "__main__":
    print("\n" + "=" * 80)
    print("FISHERY ANALYTICS - SISTEMA DE ANÁLISIS PESQUERO")
    print("=" * 80)
    print()
    
    # Ejecutar ejemplos
    example_basic_usage()
    print("\n")
    
    example_with_real_data()
    print("\n")
    
    example_api_integration()
    
    print("=" * 80)
    print("FIN DE LOS EJEMPLOS")
    print("=" * 80)
