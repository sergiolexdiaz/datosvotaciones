import pandas as pd
import time
import urllib.parse
import random
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service

# --- CONFIGURACIÓN ---
EXCEL_PATH = "1. REFERIDOS CONSULTA JOSE LUIS GIL.xlsx"
LOG_PATH = "log_envios.csv"
ESPERA_LOGIN = 20
DELAY_ENTRE_ENVÍOS = (4, 7)

# --- MENSAJE BASE ---
MENSAJE_BASE = (
    "Hola {nombre}, te escribe de parte del profesor {profesor}. "
    "Queríamos recordarte que tienes pendiente tu consulta o información personalizada. "
    "Si deseas más detalles, puedes responder a este número. 😊"
)

def preparar_mensaje(row):
    mensaje = MENSAJE_BASE.format(
        nombre=row["nombre"],
        profesor=row["profesor"]
    )
    return urllib.parse.quote(mensaje)

def enviar_mensaje(driver, telefono, mensaje):
    url = f"https://web.whatsapp.com/send?phone={telefono}&text={mensaje}"
    driver.get(url)
    time.sleep(4)
    try:
        body = driver.find_element(By.TAG_NAME, "body")
        body.send_keys(Keys.ENTER)
        return "Enviado"
    except Exception as e:
        return f"Error: {e}"

def main():
    print("📂 Cargando datos desde Excel...")
    df = pd.read_excel(EXCEL_PATH, engine="openpyxl")

    df = df.rename(columns=lambda x: str(x).strip().lower())
    ultima_columna = df.columns[-1]
    df = df.rename(columns={ultima_columna: "profesor"})

    if "telefono" not in df.columns or "nombre" not in df.columns:
        print("❌ El Excel debe tener las columnas 'telefono' y 'nombre'.")
        return

    print(f"✅ Datos cargados ({len(df)} registros).")
    print("🔗 Iniciando WhatsApp Web...")

    service = Service(ChromeDriverManager().install())
    options = webdriver.ChromeOptions()
    options.add_argument("--user-data-dir=./User_Data")
    driver = webdriver.Chrome(service=service, options=options)

    driver.get("https://web.whatsapp.com")
    print(f"⌛ Escanea el código QR si es necesario (esperando {ESPERA_LOGIN}s)...")
    time.sleep(ESPERA_LOGIN)

    resultados = []
    for i, row in df.iterrows():
        telefono = str(row["telefono"]).strip()
        if not telefono or len(telefono) < 10:
            resultados.append((telefono, "Teléfono inválido"))
            continue

        mensaje = preparar_mensaje(row)
        estado = enviar_mensaje(driver, telefono, mensaje)
        resultados.append((telefono, estado))
        print(f"{i+1}/{len(df)} -> {telefono}: {estado}")

        time.sleep(random.uniform(*DELAY_ENTRE_ENVÍOS))

    driver.quit()
    pd.DataFrame(resultados, columns=["telefono", "estado"]).to_csv(LOG_PATH, index=False)
    print(f"✅ Proceso finalizado. Revisa el archivo {LOG_PATH} para el log de envíos.")

if __name__ == "__main__":
    main()
