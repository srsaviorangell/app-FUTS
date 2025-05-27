import json
import time
from datetime import datetime
import random
import os
from zoneinfo import ZoneInfo

agora = int(time.time())
#agora_brazil = datetime.fromtimestamp(agora, ZoneInfo("america/Sao_paulo"))
intervalos = [45, 50, 58]

saida = "/app/shared-data/dados_aninhado_live.json"
entrada = '/app/shared-data/dados.json'

def aninhamento_dados_live():
    with open (entrada , "r", encoding="utf-8") as live:
     dados = json.load(live)
    json_para_API = {}
    id_dos_campeonatos = 1
    contador_jogos_por_campeonato = {}

    for evento in dados["events"]:
        pais = evento["tournament"]["category"]["name"]
        # print(f"País: {pais}")
        abreveaturaPais = evento["tournament"]["category"]["country"].get("alpha3","sem alpha3")
        if abreveaturaPais == "sem alpha3":
            abreveaturaPais = pais[:3].upper()
        pais_para_img = pais[:2].upper()
        campeonato = evento["tournament"]["name"]
        img_pais = f"https://img.sofascore.com/api/v1/country/{pais_para_img}/flag "
        genero = evento["homeTeam"].get("gender","sem genero")

        time_home = evento["homeTeam"]["name"]
        pais_time_home = evento["homeTeam"]["country"].get("name")
        id_team_home = evento["homeTeam"]["id"]
        escudo_team_home =f"https://img.sofascore.com/api/v1/team/{id_team_home}/image/small"

        time_away = evento["awayTeam"]["name"]
        pais_time_away = evento["awayTeam"]["country"].get("name","sem nome")
        id_team_away = evento["awayTeam"]["id"]
        escudo_team_away = f"https://img.sofascore.com/api/v1/team/{id_team_away}/image/small"

        score_home_partida = evento["homeScore"]["current"]
        score_home_ht = evento["homeScore"].get("period1","sem placar")
        score_home_normal_time = evento["homeScore"].get("normaltime","evento sem informacao")
        score_display_home = evento["homeScore"]["display"]

        score_away_partida = evento["awayScore"]["current"]
        score_away_ht = evento["awayScore"].get("period1","sem placar")
        score_away_normal_time = evento["awayScore"].get("normaltime","evento sem informacao")
        score_display_away = evento["awayScore"]["display"]

        data_timestamp = evento["startTimestamp"]

    # Convertendo para data e hora legíveis
        data = datetime.fromtimestamp(data_timestamp).strftime("%d/%m/%Y")
        hora = datetime.fromtimestamp(data_timestamp,ZoneInfo("America/Sao_Paulo")).strftime("%H:%M")

    # Calculando o tempo decorrido de jogo (em minutos)
        time_jogo_bruto = evento["time"].get("currentPeriodStartTimestamp",0) #hora do jogo roando o periodo do jogo 
    # time_inicio_bruto = evento["startTimestamp"] #inicio do jogo em tempo inicio
        tempo_decorrido = int(agora) - int(time_jogo_bruto) 

        if tempo_decorrido != None:
            time_live = tempo_decorrido // 60
        else:
            time_live = "//"
        
        tempo = evento["status"].get("description", "-")

        

    # Convertendo os tempos extras de segundos para minutos
        acrescimo_bruto = evento["time"].get("extra",0)
        acrescimo_final = int(acrescimo_bruto) / 60

        maximo_bruto = evento["time"].get("max",0) 
        maximo_final  = int(maximo_bruto) / 60

        inicia_bruto = evento["time"].get("initial",0) 
        inicia_final  =  int(inicia_bruto) / 60
    
        jogosVisual = {
            "time_casa": time_home ,
            "id_team_casa":  id_team_home, 
            "escudo_team_home":escudo_team_home,
            "placar_casa": score_display_home,
            "x": "x",
            "time_visitante": time_away,
            "id_team_visitante":  id_team_away,
            "escudo_team_away":escudo_team_away,
            "placar_visitante": score_display_away,
            "time_live": round(time_live) ,
            "TEMPO": tempo,
            "data": data ,
            "hora": hora ,

        },
        jogosDadosBruto ={
            "genero": genero ,
            "pais_time_home": pais_time_home ,
            "time_casa": time_home ,
            "id_team_casa":  id_team_home, 
            "placar_casa": score_display_home,
            "x": "x",
            "pais_time_away": pais_time_away ,
            "time_visitante": time_away,
            "id_team_visitante":  id_team_away, 
            "placar_visitante": score_display_away,
            "time_live": round(time_live) ,
            "TEMPO": tempo,
            "data": data ,
            "hora": hora ,
            "score_home_partida": score_home_partida, 
            "score_home_ht":score_home_ht,
            "score_home_normal_time":score_home_normal_time,
            "score_away_partida": score_away_partida, 
            "score_away_ht":score_away_ht,
            "score_away_normal_time":score_away_normal_time,
            "acrescimo_final":int(acrescimo_final),
            "maximo_final":int(maximo_final),
            "inicia_final":int(inicia_final),
            "escudo_team_home":escudo_team_home,
            "escudo_team_away":escudo_team_away,

        }
        campeonatos = {
            "id": id_dos_campeonatos,  
            "pais": pais ,
            "abreveaturaPais":abreveaturaPais,
            "campeonato":campeonato,
            "img_pais": img_pais,
        }

        if campeonato not in json_para_API:
            # Novo campeonato: inicia contagem de jogos e atribui ID
            json_para_API[campeonato] = {
                "campeonatos": campeonatos,
                "jogos": []
            }
            contador_jogos_por_campeonato[campeonato] = 1  # Inicia contagem para este campeonato
            id_jogo = f"{id_dos_campeonatos}.1"  # Primeiro jogo: ID_CAMPEONATO.1
            id_dos_campeonatos += 1  # Incrementa para o próximo campeonato
        else:
            # Campeonato existe: incrementa contador de jogos
            contador_jogos_por_campeonato[campeonato] += 1
            id_jogo = f"{json_para_API[campeonato]['campeonatos']['id']}.{contador_jogos_por_campeonato[campeonato]}"

        # Adiciona o ID ao jogo
        jogosVisual[0]["id"] = id_jogo  
        jogosDadosBruto["id"] = id_jogo

        # Adiciona o jogo à lista
        json_para_API[campeonato]["jogos"].append({
            "visual": jogosVisual,
            "dados_brutos": jogosDadosBruto
        })
    
        with open(saida ,'w',encoding='utf-8') as arquivo:
            json.dump(json_para_API, arquivo, ensure_ascii=False, indent=4)

    total_geral = 0
    for campeonato in json_para_API.values():
        total_geral += len(campeonato["jogos"])
    print(f"Total geral de jogos em todos campeonatos: {total_geral}")

try:
    while True:
        try:
            aninhamento_dados_live()
        except Exception as e:
            print("erro ao aninha:",e)
        tempo = random.choice(intervalos)
        print(f"⏱️ Aguardando {tempo} segundos até a próxima aninhamento...")

        time.sleep(tempo)
                 
except json.JSONDecodeError as e:
    print("⚠️ Erro ", e)
