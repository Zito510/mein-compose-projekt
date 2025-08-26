# Visitor Counter – Node.js + Redis (Docker Compose)

Eine einfache Zwei-Container-Anwendung:
- **app**: Node.js/Express zeigt die Anzahl der Besuche.
- **redis**: Redis speichert den Zählerstand.

---

## Start

```bash
# Build & Start (Hintergrund)
docker compose up -d --build

# Status & Logs
docker compose ps
docker compose logs app --no-log-prefix --tail=50
docker compose logs redis --no-log-prefix --tail=20

# App im Browser
http://localhost:8080
Stop / Aufräumen
bash
Kopieren
Bearbeiten
docker compose down
Dateien
package.json – Dependencies (express, redis)

index.js – Web-App (verbindet auf Hostname redis)

Dockerfile – Image für app

docker-compose.yml – Services app + redis + Healthchecks + Volume

.gitignore, .dockerignore – Build-Kontext & Repo sauber halten

Reflexion
Aha-Moment
Mit einem einzigen Befehl (docker compose up -d) starten Build, Netzwerk, beide Services und die App ist erreichbar. Keine manuelle Installation von Node/Redis nötig – Deklaration statt Handarbeit.

Service-Kommunikation
Die App findet Redis über den Service-Namen redis. Docker Compose legt ein gemeinsames Netzwerk an und stellt DNS-Auflösung bereit. Entscheidend ist:

In docker-compose.yml: Service heißt redis

In index.js: Verbindung via redis://redis:6379

Datenverlust
Ohne Volume: Nach docker compose down und erneutem up ist der Zähler wieder 0, weil Redis-Daten im Container verloren gehen.
Mit Volume (redis-data) und --appendonly yes: Zählerstand bleibt erhalten.

Bonus: Warum das mit Compose, Healthchecks & Persistenz funktioniert
1) Service-DNS & Netzwerke
Docker Compose erstellt automatisch ein internes Netzwerk, in dem sich Services über ihren Service-Namen finden.
Darum verbindet sich die App mit redis://redis:6379 – kein localhost, keine feste IP nötig.

2) depends_on mit condition: service_healthy
Die App startet erst weiter, wenn Redis „healthy“ meldet. Das verhindert Race-Conditions.
Redis-Healthcheck: redis-cli ping → Antwort PONG = gesund.

3) App-Healthcheck
Die App hat selbst einen Healthcheck (wget -qO- http://localhost:8080).
So erkennen Orchestratoren, ob der Container wirklich reagiert, und können ihn neu starten, falls nötig.

4) Persistenz über Volumes
Redis-Daten werden in ein Docker-Volume geschrieben (redis-data:/data).
Mit --appendonly yes werden Schreiboperationen zusätzlich geloggt (AOF), sodass beim Neustart der Zustand wiederhergestellt wird.

5) Idempotentes Re-Deploy
docker compose up -d --build bringt die Umgebung immer wieder in denselben deklarierten Zustand – reproduzierbar, egal auf welchem Rechner.

Nützliche Checks
Volumes anzeigen & Pfad prüfen

bash
Kopieren
Bearbeiten
docker volume ls
docker volume inspect mein-compose-projekt_redis-data
Gesundheitsstatus prüfen

bash
Kopieren
Bearbeiten
docker compose ps
docker inspect --format='{{json .State.Health}}' <container_id_der_app>
yaml
Kopieren
Bearbeiten

---

👉 Jetzt einfach diese README speichern, committen & pushen:

```bash
git add README.md
git commit -m "Update README with reflection, healthcheck and persistence explanation"
git push


Gesundheitsstatus schnell prüfen

docker compose ps
docker inspect --format='{{json .State.Health}}' <container_id_der_app> | jq
