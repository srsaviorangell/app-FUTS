from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import json
import time
import random

intervalos = [30, 38, 45]
url = 'https://www.sofascore.com/api/v1/sport/football/events/live'

options = webdriver.ChromeOptions()
options.add_argument("--headless=new")
driver = webdriver.Chrome(options=options)

def raspa_dados_live():
    driver.get(url)
    
    json_pre = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.TAG_NAME, "pre"))
    )
    json_text = json_pre.text
    
    # --- Alteração principal aqui ---
    # Carrega o JSON para validar e formatar
    json_data = json.loads(json_text)  # Converte string para dict/list
    
    # Salva o JSON formatado com indentação
    with open("dados.json", "w", encoding="utf-8") as f:
        json.dump(json_data, f, indent=4, ensure_ascii=False)  # Formata bonito
    
    print("✅ JSON formatado e salvo em 'dados.json'!")
    print("Exemplo de dados:", list(json_data.keys())[:3])
    
try:
    while True:
        try:
            raspa_dados_live()
        except Exception as e:
            print("erro ao raspar:",e)
        tempo = random.choice(intervalos)
        print(f"⏱️ Aguardando {tempo} segundos até a próxima raspagem...")

        time.sleep(tempo)
                 
except json.JSONDecodeError as e:
    print("⚠️ Erro ao decodificar JSON:", e)
except Exception as e:
    print("❌ Erro durante a extração:", e)
finally:
    driver.quit()