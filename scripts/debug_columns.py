import pandas as pd
import os

DATA_PATH = r'c:\Users\barri\OneDrive\Documentos\GitHub\Aqua-data\Base de Datos\BD_desembarque\BD_desembarque.csv'

try:
    df = pd.read_csv(DATA_PATH, sep=';', encoding='latin-1')
    print("--- Column Mapping ---")
    row = df.iloc[0]
    for col in df.columns:
        print(f"{col}: {row[col]}")
except Exception as e:
    print("Error:", e)
