# Predazioni Lupo Ticino

Questo repository contiene uno script Python per l'importazione, la pulizia e la pubblicazione di dati sulle predazioni da lupo (e altri grandi predatori) nel Canton Ticino. Il progetto nasce dall'esigenza di monitorare e documentare in modo strutturato gli episodi di predazione su animali da reddito, con particolare attenzione alla presenza del lupo, ma anche di altri predatori come volpi, cani, linci, ecc.

## Funzionalità principali

- **Estrazione automatica dei dati**: lo script scarica i dati da un feed RSS ufficiale del Cantone Ticino relativo alle predazioni da lupo.
- **Parsing e normalizzazione**: i dati vengono analizzati, puliti e normalizzati per estrarre informazioni chiave come data, località, coordinate, numero di animali predati, specie coinvolte e osservazioni.
- **Esportazione CSV**: i dati validi vengono salvati in un file CSV ([predati_source_last.csv](predati_source_last.csv)), mentre i record con errori o anomalie vengono archiviati separatamente ([predati_source_errors.csv](predati_source_errors.csv)).
- **Pubblicazione su PostGIS**: i dati vengono caricati in una tabella PostGIS con geometrie puntuali (EPSG:2056), per consentire analisi spaziali e visualizzazione su GIS.
- **Gestione automatica degli errori**: i dati incompleti o anomali vengono separati per facilitare la revisione manuale.

## Struttura del repository

- [`import_feed.py`](import_feed.py): script principale per l'importazione, la pulizia e la pubblicazione dei dati.
- [`predati_source_last.csv`](predati_source_last.csv): dati validi e normalizzati pronti per l'analisi.
- [`predati_source_errors.csv`](predati_source_errors.csv): dati scartati o da revisionare.
- `web/`: directory per eventuali strumenti web di visualizzazione (non inclusi in questa versione).
- `predati.qgz`: progetto QGIS per la visualizzazione e l'analisi spaziale dei dati (non incluso in questa versione).

## Contesto e utilità

La presenza del lupo e di altri grandi predatori in Ticino è oggetto di crescente attenzione da parte di allevatori, autorità e cittadini. Un monitoraggio accurato e aggiornato degli episodi di predazione è fondamentale per:

- Valutare l'impatto dei predatori sulle attività agricole e zootecniche.
- Supportare le decisioni di gestione e prevenzione (recinzioni, cani da protezione, ecc.).
- Fornire dati trasparenti e accessibili a enti pubblici, ricercatori e opinione pubblica.
- Analizzare la distribuzione spaziale e temporale degli eventi.

## Requisiti

- Python 3.x
- Librerie: `feedparser`, `csv`, `re`, `psycopg2`
- Un database PostgreSQL/PostGIS per la pubblicazione dei dati

## Utilizzo

1. Configura i parametri di accesso al database in [`import_feed.py`](import_feed.py).
2. Esegui lo script:
   ```sh
   python import_feed.py
   ```
3. I dati saranno disponibili nei file CSV e nella tabella `predazioni_lupo` su PostGIS.

## Licenza

MIT (vedi file LICENSE).

---

**Autore:** Dr. Sara Lanini-Maggi, ask@intelligeo.ch
