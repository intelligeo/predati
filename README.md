# Predazioni da Lupo in Canton Ticino

Questo repository contiene uno script Python per l’importazione, la pulizia e la pubblicazione di dati sulle predazioni da lupo (e altri grandi predatori) nel Canton Ticino. I dati vengono estratti automaticamente dal feed RSS ufficiale del Cantone, normalizzati, esportati in CSV e pubblicati su una tabella PostGIS per analisi spaziali.

## Funzionalità principali

- **Estrazione automatica** dal feed RSS cantonale sulle predazioni.
- **Parsing e normalizzazione** dei dati: data, luogo, coordinate, numero e specie di animali predati, osservazioni.
- **Esportazione CSV**: dati validi in `predati_source_last.csv`, dati anomali in `predati_source_errors.csv`.
- **Pubblicazione su PostGIS**: caricamento automatico dei dati validi in una tabella spaziale (EPSG:2056).
- **Gestione errori**: i record incompleti o sospetti vengono separati per revisione.

## Utilizzo

1. **Configurazione variabili d’ambiente**  
   Lo script legge i parametri di connessione al database PostGIS da variabili d’ambiente (consigliato l’uso di GitHub Actions secrets):

   - `POSTGIS_DBNAME`
   - `POSTGIS_USER`
   - `POSTGIS_PASSWORD`
   - `POSTGIS_HOST`
   - `POSTGIS_PORT`

2. **Esecuzione manuale**
   ```sh
   python import_feed.py
   ```

3. **Esecuzione automatica**
   È incluso un workflow GitHub Actions (`automation/daily_update.yml`) che aggiorna i dati ogni giorno alle 18:00 UTC.

## Dipendenze

- Python 3.11+
- feedparser
- psycopg2

Installa le dipendenze con:
```sh
pip install feedparser psycopg2
```

## Struttura del repository

- `import_feed.py` — Script principale di importazione e pubblicazione dati.
- `predati_source_last.csv` — Dati validi e normalizzati.
- `predati_source_errors.csv` — Dati scartati o da revisionare.
- `automation/daily_update.yml` — Workflow GitHub Actions per aggiornamento automatico.

## Contesto

La presenza del lupo e di altri grandi predatori in Ticino è oggetto di attenzione da parte di allevatori, autorità e cittadini. Questo progetto fornisce dati aggiornati e strutturati per monitorare il fenomeno, supportare la gestione e favorire la trasparenza.

---

**Autore:** Dr. Sara Lanini-Maggi — [www.intelligeo.ch](https://www.intelligeo.ch)
