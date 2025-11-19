"""
Script de prueba para los nuevos métodos del Módulo de Cosechas.

Prueba los 4 métodos específicos:
1. get_agent_distribution() - Donut Chart Industrial vs Artesanal
2. get_top_ports() - Ranking de Puertos
3. get_species_by_agent_breakdown() - Barras Apiladas por Especie
4. get_seasonal_context() - Comparación Estacional

Author: Barri - Aqua-Data PM
Date: 2025-11-19
"""

import sys
import json
from pathlib import Path

# Agregar el directorio raíz al path
root_path = Path(__file__).parent.parent
sys.path.append(str(root_path))

from python_analytics.fishery_analytics import load_fishery_data


def main():
    """Ejecuta pruebas de los métodos del módulo de cosechas."""
    
    print("=" * 80)
    print("PRUEBA DE MÉTODOS DEL MÓDULO DE COSECHAS")
    print("=" * 80)
    
    # Rutas a los archivos CSV
    desembarque_path = root_path / "Base de Datos" / "BD_desembarque" / "BD_desembarque.csv"
    produccion_path = root_path / "Base de Datos" / "BD_materia_prima_produccion" / "BD_materia_prima_produccion.csv"
    plantas_path = root_path / "Base de Datos" / "BD_plantas" / "BD_plantas.csv"
    
    # Cargar datos
    print("\n📦 Cargando datos desde CSV...")
    analytics = load_fishery_data(
        str(desembarque_path),
        str(produccion_path),
        str(plantas_path)
    )
    print("✅ Datos cargados correctamente\n")
    
    # ========================================================================
    # PRUEBA 1: Distribución por Tipo de Agente
    # ========================================================================
    print("\n" + "=" * 80)
    print("1️⃣  DISTRIBUCIÓN POR TIPO DE AGENTE (Donut Chart)")
    print("=" * 80)
    
    # Sin filtros
    result1 = analytics.get_agent_distribution()
    print("\n📊 Sin filtros (todos los años, todas las regiones):")
    print(f"   Total de toneladas: {result1['summary']['total_toneladas']:,.2f}")
    print(f"   Número de tipos de agente: {result1['summary']['num_tipos_agente']}")
    print(f"   Tipo dominante: {result1['summary']['tipo_dominante']} ({result1['summary']['porcentaje_dominante']}%)")
    print("\n   Distribución:")
    for item in result1['data']:
        print(f"   - {item['tipo_agente']}: {item['toneladas']:,.2f} ton ({item['porcentaje']}%)")
    
    # Con filtro de año
    result1_year = analytics.get_agent_distribution(year=2024)
    print(f"\n📊 Año 2024:")
    print(f"   Total: {result1_year['summary']['total_toneladas']:,.2f} ton")
    for item in result1_year['data']:
        print(f"   - {item['tipo_agente']}: {item['porcentaje']}%")
    
    # Con filtro de región
    result1_region = analytics.get_agent_distribution(region="LAGOS")
    print(f"\n📊 Región de Los Lagos:")
    print(f"   Total: {result1_region['summary']['total_toneladas']:,.2f} ton")
    for item in result1_region['data']:
        print(f"   - {item['tipo_agente']}: {item['porcentaje']}%")
    
    # ========================================================================
    # PRUEBA 2: Top Puertos
    # ========================================================================
    print("\n" + "=" * 80)
    print("2️⃣  RANKING DE PUERTOS (Bar Chart)")
    print("=" * 80)
    
    # Top 10 puertos sin filtros
    result2 = analytics.get_top_ports(top_n=10)
    print(f"\n📊 Top 10 Puertos (todos los años):")
    print(f"   Total top 10: {result2['summary']['total_toneladas_top_n']:,.2f} ton")
    print(f"   Concentración: {result2['summary']['porcentaje_concentracion']}%")
    print(f"   Puerto líder: {result2['summary']['puerto_lider']}")
    print("\n   Ranking:")
    for item in result2['data'][:5]:  # Mostrar solo top 5
        print(f"   {item['ranking']}. {item['puerto']}: {item['toneladas']:,.2f} ton")
    
    # Top 5 puertos en 2024
    result2_2024 = analytics.get_top_ports(year=2024, top_n=5)
    print(f"\n📊 Top 5 Puertos en 2024:")
    for item in result2_2024['data']:
        print(f"   {item['ranking']}. {item['puerto']}: {item['toneladas']:,.2f} ton")
    
    # ========================================================================
    # PRUEBA 3: Especies por Tipo de Agente (Stacked Bar)
    # ========================================================================
    print("\n" + "=" * 80)
    print("3️⃣  ESPECIES POR TIPO DE AGENTE (Stacked Bar Chart)")
    print("=" * 80)
    
    # Top 10 especies
    result3 = analytics.get_species_by_agent_breakdown(top_n=10)
    print(f"\n📊 Top 10 Especies con desglose por tipo de agente:")
    print(f"   Total toneladas: {result3['summary']['total_toneladas']:,.2f}")
    print(f"   Especie líder: {result3['summary']['especie_lider']}")
    print(f"   Tipos de agente: {', '.join(result3['summary']['tipos_agente'])}")
    
    print("\n   Participación por tipo de agente:")
    for agente, total in result3['summary']['participacion_por_tipo'].items():
        print(f"   - {agente}: {total:,.2f} ton")
    
    print("\n   Top 5 Especies (desglose):")
    for item in result3['data'][:5]:
        print(f"\n   🐟 {item['especie']} (Total: {item['total']:,.2f} ton)")
        for agente in result3['summary']['tipos_agente']:
            if agente in item:
                print(f"      - {agente}: {item[agente]:,.2f} ton")
    
    # Top 5 especies en 2023
    result3_2023 = analytics.get_species_by_agent_breakdown(year=2023, top_n=5)
    print(f"\n📊 Top 5 Especies en 2023:")
    print(f"   Total: {result3_2023['summary']['total_toneladas']:,.2f} ton")
    
    # ========================================================================
    # PRUEBA 4: Contexto Estacional
    # ========================================================================
    print("\n" + "=" * 80)
    print("4️⃣  CONTEXTO ESTACIONAL (Línea Temporal Comparativa)")
    print("=" * 80)
    
    # Comparación 2023 vs histórico
    result4 = analytics.get_seasonal_context(current_year=2023)
    print(f"\n📊 Año 2023 vs Promedio Histórico:")
    print(f"   Años históricos incluidos: {result4['summary']['años_historicos_incluidos']}")
    print(f"   Total 2023: {result4['summary']['total_actual']:,.2f} ton")
    print(f"   Total histórico: {result4['summary']['total_historico']:,.2f} ton")
    print(f"   Variación: {result4['summary']['variacion_anual']:,.2f}%")
    print(f"   Mes mayor 2023: {result4['summary']['mes_mayor_actual']}")
    print(f"   Mes mayor histórico: {result4['summary']['mes_mayor_historico']}")
    
    print("\n   Comparación mensual (primeros 6 meses):")
    print("   " + "-" * 70)
    print(f"   {'Mes':<12} {'Actual':>12} {'Histórico':>12} {'Diferencia':>12} {'Var %':>10}")
    print("   " + "-" * 70)
    for item in result4['data'][:6]:
        print(f"   {item['mes_nombre']:<12} {item['actual']:>12,.2f} {item['historico']:>12,.2f} "
              f"{item['diferencia']:>12,.2f} {item['variacion_porcentual']:>9.2f}%")
    
    # Comparación 2024 vs histórico en región Lagos
    result4_lagos = analytics.get_seasonal_context(current_year=2024, region="LAGOS")
    print(f"\n📊 Año 2024 vs Histórico - Región de Los Lagos:")
    print(f"   Total 2024: {result4_lagos['summary']['total_actual']:,.2f} ton")
    print(f"   Variación: {result4_lagos['summary']['variacion_anual']:,.2f}%")
    
    # ========================================================================
    # EXPORTAR RESULTADOS A JSON
    # ========================================================================
    print("\n" + "=" * 80)
    print("💾 EXPORTANDO RESULTADOS A JSON")
    print("=" * 80)
    
    output_dir = root_path / "python_analytics" / "output"
    output_dir.mkdir(exist_ok=True)
    
    results = {
        'agent_distribution': result1,
        'top_ports': result2,
        'species_by_agent_breakdown': result3,
        'seasonal_context': result4
    }
    
    output_file = output_dir / "cosechas_analysis_results.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Resultados exportados a: {output_file}")
    
    print("\n" + "=" * 80)
    print("✅ PRUEBAS COMPLETADAS")
    print("=" * 80)


if __name__ == "__main__":
    main()
