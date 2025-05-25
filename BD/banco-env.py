import json
import os
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import random
import time
from urllib.parse import quote_plus



intervalos = [50, 55, 58]


diretorio_base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
diretorio_de_entrada = os.path.join(diretorio_base,'shared-data')
dados_aninhado = 'dados_aninhado_live.json'
dados_brutos = 'dados.json'
json_live_aninhado = os.path.join(diretorio_de_entrada, dados_aninhado)
json_live_bruto = os.path.join(diretorio_de_entrada, dados_brutos)


with open (json_live_aninhado , "r", encoding="utf-8") as live:
    json_live = json.load(live)

class BancoRaspagem:
    def __init__(self):
        usuario = "savio0dev"
        senha = "Sa07ca16@"
        senha_escapada = quote_plus(senha)
        self.uri = f"mongodb+srv://{usuario}:{senha_escapada}@savi0dev.qmvjqus.mongodb.net/?retryWrites=true&w=majority&appName=savi0dev"

        self.client = MongoClient(self.uri, server_api=ServerApi('1'))
        self._testar_conexao()

    def _testar_conexao(self):
        try:
            self.client.admin.command('ping')
            print("Pinged your deployment. You successfully connected to MongoDB!")
        except Exception as e:
            print(f"falha na conexão,{e}")

    def carregar_json(self, arquivo="dados_aninhado_live.json"):
        caminho = os.path.join(diretorio_de_entrada, arquivo)
        try:
            with open(caminho,"r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"❌ Arquivo não encontrado: {caminho}")
            return None
        except json.JSONDecodeError:
            print(f"❌ Erro ao decodificar JSON: {caminho}")
            return None
    def enviar_para_mongo(self, dados, colecao="live", banco="raspagem"):
        if not dados:
            print("⚠️ Nenhum dado para enviar")
            return False
        try:
            db = self.client[banco]
            result = db[colecao].update_one(
                {"id": dados.get("id")},  # Assumindo que existe um campo 'id'
                {"$set": dados},
                upsert=True
            )
            print(f"📌 Dados {'inseridos' if result.upserted_id else 'atualizados'}")
            return True
        except Exception as e:
            print(f"❌ Erro ao enviar para MongoDB: {e}")
            return False
        
def main():
    banco = BancoRaspagem()
    
    try:
        while True:
            try:
                dados = banco.carregar_json()
                if dados:
                    banco.enviar_para_mongo(dados)
                else:
                    print("⚠️ Nenhum dado válido para enviar")
                
            except Exception as e:
                print(f"Erro durante o processamento: {e}")
            
            tempo = random.choice(intervalos)
            print(f"⏱️ Aguardando {tempo} segundos até a próxima atualização...")
            time.sleep(tempo)
            
    except Exception as e:
        print(f"❌ Erro crítico: {e}")
    finally:
        banco.client.close()
    
main()