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
