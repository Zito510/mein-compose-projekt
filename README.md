# Visitor Counter – Node.js + Redis (Docker Compose)

Eine einfache Zwei-Container-Anwendung:
- **app**: Node.js/Express zeigt die Anzahl der Besuche.
- **redis**: Redis speichert den Zählerstand.

## Start

```bash
# Build & Start (Hintergrund)
docker compose up -d

# Status & Logs
docker compose ps
docker compose logs app --no-log-prefix --tail=50
docker compose logs redis --no-log-prefix --tail=20

# App im Browser
http://localhost:8080

Bonus: Warum das mit Compose, Healthchecks & Persistenz funktioniert

1) Service-DNS & Netzwerke
Docker Compose erstellt automatisch ein internes Netzwerk, in dem sich Services über ihren Service-Namen finden.
Darum verbindet sich die App mit redis://redis:6379 – kein localhost, kein feste IP nötig.

2) depends_on mit condition: service_healthy
Die App startet erst weiter, wenn Redis „healthy“ meldet. Das verhindert Race-Conditions (App versucht zu früh zu verbinden).
Der Redis-Healthcheck nutzt redis-cli ping → antwortet Redis mit PONG, ist der Service gesund.

3) App-Healthcheck
Die App hat selbst einen Healthcheck (wget -qO- http://localhost:8080).
Orchestratoren/Compose erkennen so „unhealthy“ Zustände (z. B. Crash) und können neu starten oder nicht anfragen verteilen.

4) Persistenz über Volumes
Redis speichert Daten im Container-Dateisystem – ohne Volume wären sie beim Entfernen verloren.
Mit

volumes:
  - redis-data:/data


werden Daten außerhalb des Containers abgelegt (Docker-Volume redis-data).
Zusätzlich aktiviert --appendonly yes das AOF (Append-Only-File). Dadurch werden Schreiboperationen geloggt und beim Start wiederhergestellt. Ergebnis: Zähler bleibt erhalten – auch nach down/up.

5) Idempotentes Re-Deploy
docker compose up -d --build ist deklarativ: Compose liest die YAML und bringt das System in den beschriebenen Zustand (Images bauen, Container erzeugen/aktualisieren, Netzwerk/Volumes bereitstellen).
Keine manuelle Schritt-für-Schritt-Installation nötig.

Nützliche Checks (optional in README aufnehmen)

Volumes anzeigen & Pfad prüfen

docker volume ls
docker volume inspect mein-compose-projekt_redis-data


Gesundheitsstatus schnell prüfen

docker compose ps
docker inspect --format='{{json .State.Health}}' <container_id_der_app> | jq
