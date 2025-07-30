# =============================================================================
# Autore:      Dr. Sara Lanini-Maggi - www.intelligeo.ch
# Versione:    1.0.1
# Data:        2025-07-30
# Abstract:    Script per l'importazione, la pulizia e la pubblicazione di dati
#              sulle predazioni da lupo in Ticino. I dati vengono estratti da un
#              feed RSS, normalizzati, esportati in CSV e pubblicati su PostGIS
#              con geometrie di tipo punto (EPSG:2056). Gestione automatica di
#              errori e dati anomali su file separato.
# =============================================================================

import os
import feedparser
import csv
import re
import psycopg2
from psycopg2.extras import execute_values
from pyproj import Transformer

# Mappa per numeri in lettere
NUMERI_LETTERE = {
    "una": 1, "uno": 1, "un'": 1, "un": 1, "due": 2, "tre": 3, "quattro": 4, "cinque": 5,
    "sei": 6, "sette": 7, "otto": 8, "nove": 9, "dieci": 10, "undici": 11, "dodici": 12,
    "tredici": 13, "quattordici": 14, "quindici": 15, "sedici": 16, "diciassette": 17,
    "diciotto": 18, "diciannove": 19, "venti": 20
}

SPECIE = [
    "capra", "pecora", "agnello", "mucca", "cavallo", "lama", "cervo", "cerbiatto", "camoscio"
]

# Trasformatore da LV95 (EPSG:2056) a WGS84 (EPSG:4326)
transformer = Transformer.from_crs("EPSG:2056", "EPSG:4326", always_xy=True)

def estrai_numero_predati(testo):
    # Cerca prima cifre
    match = re.search(r'(\d+)', testo)
    if match:
        return match.group(1)
    # Cerca numeri in lettere
    for parola in NUMERI_LETTERE:
        if re.search(rf"\b{parola}\b", testo, re.IGNORECASE):
            return str(NUMERI_LETTERE[parola])
    return ""

def estrai_specie_predate(testo):
    # Usa solo la forma plurale tra quelle definite in SPECIE, tutto il resto è 'altro'
    specie_singolari = [
        "capra", "pecora", "agnello", "mucca", "vitello", "vitellino", "cavallo", "lama", "cervo", "cerbiatto", "camoscio", "daino"
    ]
    trovate = set()
    for specie in specie_singolari:
        # Costruisci il plurale regolare (es. capra/capre, pecora/pecore, agnello/agnelli, ecc.)
        if specie.endswith("a"):
            plurale = specie[:-1] + "e"
        elif specie.endswith("o"):
            plurale = specie[:-1] + "i"
        else:
            plurale = specie + "i"
        pattern = rf"\b({specie}|{plurale})\b"
        if re.search(pattern, testo, re.IGNORECASE):
            trovate.add(specie)
    if trovate:
        # Restituisci solo i singolari, ordinati e senza duplicati
        return ", ".join(sorted(trovate))
    return "altro"

def estrai_numero_predati(testo):
    # Cerca prima cifre
    match = re.search(r'(\d+)', testo)
    if match:
        return match.group(1)
    # Cerca numeri in lettere
    for parola in NUMERI_LETTERE:
        if re.search(rf"\b{parola}\b", testo, re.IGNORECASE):
            return str(NUMERI_LETTERE[parola])
    return ""

def estrai_specie_predate(testo):
    # Cerca la specie dopo il numero (cifre o lettere)
    match = re.search(r'(?:\d+|una|un\'|un|uno|due|tre|quattro|cinque|sei|sette|otto|nove|dieci|undici|dodici|tredici|quattordici|quindici|sedici|diciassette|diciotto|diciannove|venti)\s+([a-zA-Zàèéìòùç ]+?)(?:\s+mort[aei]?|$)', testo, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return ""

# URL del feed RSS
feed_url = "https://www3.ti.ch/xml/rss/rss-attualita-Lupo.xml"

# Parser del feed RSS
feed = feedparser.parse(feed_url)

# Apri il file CSV principale e quello degli errori
with open('predati_source_last.csv', 'w', newline='', encoding='utf-8') as csvfile, \
     open('predati_source_errors.csv', 'w', newline='', encoding='utf-8') as errorfile:
    writer = csv.writer(csvfile)
    error_writer = csv.writer(errorfile)

    # Intestazione per entrambi i file
    header = [
        "Data", "Luogo", "X", "Y",
        "Numero_Predati", "Specie_Predate", "Osservazioni",
        "Long", "Lat"
    ]
    writer.writerow(header)
    error_writer.writerow(header)

    for post in feed.entries:
        try:
            data = getattr(post, "published", "")
            titolo = getattr(post, "title", "")
            campi = titolo.split(" - ")

            localita = campi[0].strip() if len(campi) > 0 else ""
            coordinate = campi[1].strip() if len(campi) > 1 else ""
            predati = campi[2].strip() if len(campi) > 2 else ""
            capi_dispersi = campi[3].strip() if len(campi) > 3 else ""
            riscontro_dna = campi[4].strip() if len(campi) > 4 else ""
            probabile_predatore = campi[5].strip() if len(campi) > 5 else ""

            # Estrazione coordinate X e Y
            match = re.search(r'(\d{3,6})\s*/\s*(\d{3,6})', coordinate)
            if match:
                x = match.group(1)
                y = match.group(2)
                if len(x) == 3:
                    x += "000"
                if len(y) == 3:
                    y += "000"
                x = str(int(x) + 2000000)
                y = str(int(y) + 1000000)
            else:
                x = ""
                y = ""

            # Conversione in WGS84
            if x and y:
                try:
                    long, lat = transformer.transform(int(x), int(y))
                except Exception:
                    long, lat = "", ""
            else:
                long, lat = "", ""

            # Estrazione Numero_Predati e Specie_Predate
            numero_predati = estrai_numero_predati(predati)
            specie_predate = estrai_specie_predate(predati)

            # Raggruppa le osservazioni e sostituisci gli a capo con spazi
            osservazioni = " ".join(f for f in [capi_dispersi, riscontro_dna, probabile_predatore] if f)
            osservazioni = osservazioni.replace('\n', ' ').replace('\r', ' ')

            # Controllo per errori
            errore = (
                not x or not y or
                not numero_predati or numero_predati.lower() == "null"
            )
            try:
                if int(numero_predati) > 50:
                    errore = True
            except Exception:
                if not numero_predati or numero_predati.lower() == "null":
                    errore = True

            row = [
                data, localita, x, y,
                numero_predati, specie_predate, osservazioni,
                long, lat
            ]

            if errore:
                error_writer.writerow(row)
            else:
                writer.writerow(row)
        except Exception as e:
            print(f"Errore durante l'elaborazione del post: {e}")
    