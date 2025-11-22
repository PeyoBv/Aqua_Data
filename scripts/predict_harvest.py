import pandas as pd
import numpy as np
import json
import os
import sys
from datetime import datetime, timedelta

# Define paths relative to the script location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DATA_PATH = os.path.join(PROJECT_ROOT, 'Base de Datos', 'BD_desembarque', 'BD_desembarque.csv')
OUTPUT_DIR = os.path.join(PROJECT_ROOT, 'frontend', 'public', 'data')
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'all_predictions.json')

def ensure_output_directory():
    """Ensure the output directory exists."""
    if not os.path.exists(OUTPUT_DIR):
        print(f"Creating output directory: {OUTPUT_DIR}")
        os.makedirs(OUTPUT_DIR)

def save_json(data, filename):
    """Save data to JSON file."""
    ensure_output_directory()
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Successfully saved predictions to: {filename}")
    except Exception as e:
        print(f"Error saving JSON: {e}")
        sys.exit(1)

def get_forecast(df_history, periods=24):
    """
    Generate forecast using Prophet or Fallback.
    Returns a list of dicts: {date, value, type}
    """
    # Prepare history data for output
    history_data = df_history.copy()
    history_data['date'] = history_data['date'].dt.strftime('%Y-%m-%d')
    history_data['type'] = 'history'
    output_list = history_data[['date', 'value', 'type']].to_dict('records')
    
    if len(df_history) < 12:
        print("  -> Not enough data for forecast (min 12 months). Returning history only.")
        return output_list

    # Try Prophet
    try:
        from prophet import Prophet
        # print("  -> Attempting Prophet forecast...")
        
        df_prophet = df_history.rename(columns={'date': 'ds', 'value': 'y'})
        
        m = Prophet(yearly_seasonality=True, daily_seasonality=False, weekly_seasonality=False)
        # Suppress Prophet output
        with open(os.devnull, 'w') as devnull:
            old_stdout = sys.stdout
            sys.stdout = devnull
            try:
                m.fit(df_prophet)
            finally:
                sys.stdout = old_stdout

        future = m.make_future_dataframe(periods=periods, freq='MS')
        forecast = m.predict(future)
        
        last_history_date = df_history['date'].max()
        future_forecast = forecast[forecast['ds'] > last_history_date].copy()
        
        for _, row in future_forecast.iterrows():
            output_list.append({
                "date": row['ds'].strftime('%Y-%m-%d'),
                "value": round(row['yhat'], 2),
                "type": "prediction"
            })
        # print("  -> Prophet success.")
            
    except Exception as e:
        print(f"  -> Prophet failed ({e}). Using Fallback (Moving Average).")
        
        # Fallback: Moving Average of last 12 months
        last_12_months = df_history.sort_values('date').tail(12)
        avg_value = last_12_months['value'].mean()
        
        last_date = df_history['date'].max()
        future_dates = [last_date + pd.DateOffset(months=i+1) for i in range(periods)]
        
        for date in future_dates:
            output_list.append({
                "date": date.strftime('%Y-%m-%d'),
                "value": round(avg_value, 2),
                "type": "prediction"
            })
            
    return output_list

def main():
    print("Starting Multi-Species Harvest Prediction Script...")
    
    # 1. Load Data
    if not os.path.exists(DATA_PATH):
        print(f"Error: Data file not found at {DATA_PATH}")
        sys.exit(1)
        
    df = None
    encodings = ['utf-8', 'latin-1', 'cp1252']
    separators = [',', ';']
    
    print(f"Loading data from {DATA_PATH}...")
    print(f"Loading data from {DATA_PATH}...")
    # Force semicolon separator as verified by debug script
    try:
        df = pd.read_csv(DATA_PATH, sep=';', encoding='latin-1')
        print("Successfully loaded with separator ';'")
    except Exception as e:
        print(f"Error loading with ';': {e}")
        sys.exit(1)
        
    if df is not None:
        print("First row sample:")
        print(df.iloc[0].to_dict())
    
    if df is None:
        print("Error: Could not read CSV.")
        sys.exit(1)

    # Normalize columns
    df.columns = [c.upper() for c in df.columns]
    
    # Identify columns
    print(f"Columns found: {df.columns.tolist()}")
    
    # Smart Species Column Detection
    # Prioritize columns with 'ESPECIE' but exclude 'COD', 'CD', 'ID' to find the name
    species_candidates = [c for c in df.columns if 'ESPECIE' in c]
    name_candidates = [c for c in species_candidates if not any(x in c for x in ['COD', 'CD', 'ID'])]
    
    if name_candidates:
        # Prefer column with 'NOM' or 'NOMBRE'
        best_name = next((c for c in name_candidates if 'NOM' in c), None)
        if best_name:
            species_col = best_name
        else:
            species_col = name_candidates[0]
    elif species_candidates:
        species_col = species_candidates[0]
    else:
        species_col = None
    date_col = next((c for c in df.columns if 'FECHA' in c or 'ANO' in c or 'AÑO' in c), None)
    region_col = next((c for c in df.columns if 'REGION' in c), None)

    # Smart Value Column Detection
    # 1. Priority: Exact matches
    priority_cols = ['TONELADAS', 'TONELADA', 'VALOR', 'PESO', 'DESEMBARQUE']
    val_col = next((c for c in df.columns if c in priority_cols), None)
    
    # 2. Fallback: Contains 'TON' or 'DESEMBARQUE' but NOT 'REGION', 'CODIGO', 'FECHA'
    if not val_col:
        candidates = [c for c in df.columns if ('TON' in c or 'DESEMBARQUE' in c) 
                      and not any(x in c for x in ['REGION', 'CODIGO', 'FECHA', 'NOM'])]
        if candidates:
            val_col = candidates[0]

    print(f"Identified Columns -> Species: {species_col}, Date: {date_col}, Value: {val_col}, Region: {region_col}")

    if not all([species_col, val_col]):
        print(f"Error: Missing required columns.")
        sys.exit(1)

    # Clean Value
    # Force to numeric, coerce errors to NaN
    if df[val_col].dtype == object:
        df[val_col] = df[val_col].astype(str).str.replace(',', '.')
        
    df[val_col] = pd.to_numeric(df[val_col], errors='coerce')
    
    # Drop rows with NaN values in value column
    initial_len = len(df)
    df = df.dropna(subset=[val_col])
    if len(df) < initial_len:
        print(f"Dropped {initial_len - len(df)} rows with invalid numeric values.")

    # Handle Date
    if 'ANO' in df.columns and 'MES' in df.columns:
        df['date'] = pd.to_datetime(df['ANO'].astype(str) + '-' + df['MES'].astype(str) + '-01')
    elif 'AÑO' in df.columns and 'MES' in df.columns:
        df['date'] = pd.to_datetime(df['AÑO'].astype(str) + '-' + df['MES'].astype(str) + '-01')
    elif date_col:
        df['date'] = pd.to_datetime(df[date_col])
    else:
        print("Error: Could not create date column.")
        sys.exit(1)

    # 2. Identify Top 5 Species
    print("Identifying Top 5 Species...")
    top_species = df.groupby(species_col)[val_col].sum().sort_values(ascending=False).head(5).index.tolist()
    print(f"Top Species: {top_species}")

    all_predictions = {}

    # 3. Loop through Species
    for species in top_species:
        print(f"\nProcessing Species: {species}")
        all_predictions[species] = {}
        
        # Filter Species Data
        df_species = df[df[species_col] == species].copy()
        
        # --- A. National Level (TODAS) ---
        print("  > Training National Model (TODAS)...")
        df_national = df_species.groupby('date')[val_col].sum().reset_index()
        df_national.columns = ['date', 'value']
        
        all_predictions[species]['TODAS'] = get_forecast(df_national)
        
        # --- B. Regional Level (Optional/Key Regions) ---
        # Let's do it for all regions that have significant data, or just key ones?
        # Prompt says: "Opcional (Si es rápido): Entrena también modelos específicos para las regiones clave (Lagos, Aysén, Magallanes)"
        # Let's try to do it for top 3 regions for that species to keep it fast.
        
        if region_col:
            top_regions = df_species.groupby(region_col)[val_col].sum().sort_values(ascending=False).head(3).index.tolist()
            for region in top_regions:
                # Clean region name for JSON key (optional, but good practice)
                region_key = str(region).upper().strip()
                print(f"  > Training Regional Model: {region_key}...")
                
                df_region = df_species[df_species[region_col] == region].copy()
                df_region_agg = df_region.groupby('date')[val_col].sum().reset_index()
                df_region_agg.columns = ['date', 'value']
                
                all_predictions[species][region_key] = get_forecast(df_region_agg)

    # 4. Save Output
    save_json(all_predictions, OUTPUT_FILE)

if __name__ == "__main__":
    main()
