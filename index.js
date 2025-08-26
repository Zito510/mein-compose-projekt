const express = require('express');
const redis = require('redis');
const app = express();

/**
 * Verbindet sich zu Redis unter dem Hostnamen "redis" (Service-Name aus docker-compose).
 */
const client = redis.createClient({ url: 'redis://redis:6379' });

client.on('error', (err) => {
  console.error('Redis-Fehler:', err);
});

(async () => {
  await client.connect();
  // Key initialisieren, falls nicht vorhanden
  const exists = await client.exists('visits');
  if (!exists) {
    await client.set('visits', 0);
  }
})();

app.get('/', async (req, res) => {
  try {
    const visits = parseInt(await client.get('visits')) || 0;
    await client.set('visits', visits + 1);
    res.send(`<h1>Anzahl der Besuche: ${visits}</h1><p>Lade die Seite neu, um den Zähler zu erhöhen.</p>`);
  } catch (e) {
    res.status(500).send(`Fehler: ${e.message}`);
  }
});

app.listen(8080, () => {
  console.log('Besucherzähler-App lauscht auf Port 8080');
});
