// 🌸 AnimeGuardianBot — Diagnóstico & KeepAlive
// Breno & Sofya Edition 💞
// Replit-ready: expõe / e /health para UptimeRobot + logs detalhados

import axios from "axios";
import express from "express";


// 🛠️ CONFIGURE AQUI
// Host Aternos (domínio que vocês usam para entrar no MC)
const MC_HOST = "brenothy.aternos.me"; // troque se for outro
// URL web a “pingar” (nem todo host de MC responde HTTP; usamos mesmo assim para ensaio)
const PING_HTTP_URL = `https://${MC_HOST}/`; // manter barra final
// Monitor externo de status (opcional) - consulta pública do status do host
const STATUS_API = `https://api.mcsrvstat.us/2/${MC_HOST}`;

const PING_INTERVAL_MS = 5 * 60 * 1000;      // 5 min — keepalive principal
const QUICK_LOG_INTERVAL_MS = 60 * 1000;     // 1 min — batimentos no console

// ----------------- Web server (Replit stay-awake) -----------------
const app = express();

let lastPing = { ok: false, when: null, msg: "Ainda não pingou" };
let lastDNS  = { ok: false, when: null, addresses: [], msg: "Ainda não checou" };
let lastStat = { ok: false, when: null, raw: null, msg: "Ainda não consultado" };

app.get("/", (_req, res) => {
  res.send("✅ AnimeGuardianBot está rodando! Use /health para diagnóstico detalhado. 🌸");
});

app.get("/health", (_req, res) => {
  res.json({
    now: new Date().toISOString(),
    target: { MC_HOST, PING_HTTP_URL },
    lastPing,
    lastDNS,
    lastStatusCheck: lastStat
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌐 Web UP em http://localhost:${PORT}  (use esse link no UptimeRobot)`);
});

// ----------------- Utilidades -----------------
async function checkDNS() {
    console.log("🧭 Ignorando checagem DNS (não suportada neste ambiente).");
    lastDNS = {
      ok: true,
      when: new Date().toISOString(),
      addresses: [],
      msg: "Ignorado (ambiente sem suporte a dns/promises)"
    };
  }


async function httpKeepAlive() {
  try {
    // Alguns destinos retornam 403/404 — ainda conta como “acordou”
    const r1 = await axios.get(PING_HTTP_URL, { timeout: 8000 }).catch(err => err.response || { status: "ERR", statusText: err.message });
    const r2 = await axios.head(PING_HTTP_URL, { timeout: 8000 }).catch(err => err.response || { status: "ERR", statusText: err.message });
    const r3 = await axios.get(PING_HTTP_URL + "favicon.ico", { timeout: 8000 }).catch(err => err.response || { status: "ERR", statusText: err.message });

    const info = `GET:${r1.status} HEAD:${r2.status} FAV:${r3.status}`;
    lastPing = { ok: true, when: new Date().toISOString(), msg: info };
    console.log(`✅ KeepAlive@${new Date().toLocaleTimeString()} | ${info}`);
  } catch (e) {
    lastPing = { ok: false, when: new Date().toISOString(), msg: e.message };
    console.log(`⚠️ KeepAlive ERRO: ${e.message}`);
  }
}

async function statusCheck() {
  try {
    const { data } = await axios.get(STATUS_API, { timeout: 8000 });
    // Estrutura comum: { online: true/false, ip, port, players, version, ... }
    lastStat = { ok: true, when: new Date().toISOString(), raw: data, msg: data.online ? "MC ONLINE" : "MC OFFLINE" };
    console.log(`📡 Status: ${data.online ? "ONLINE" : "offline"} | versão: ${data.version || "?"} | players: ${data.players?.online ?? "?"}`);
  } catch (e) {
    lastStat = { ok: false, when: new Date().toISOString(), raw: null, msg: e.message };
    console.log(`📡 StatusCheck ERRO: ${e.message}`);
  }
}

// Batimento visual no console (a cada 1 min) pra mostrar que o bot está vivo
setInterval(() => {
  console.log(`⏱️ Tick ${new Date().toLocaleTimeString()} | DNS:${lastDNS.ok ? "OK" : "X"} | Ping:${lastPing.ok ? "OK" : "X"} | Stat:${lastStat.ok ? "OK" : "X"}`);
}, QUICK_LOG_INTERVAL_MS);

// Ciclos principais
(async () => {
  console.log("🌙 AnimeGuardianBot iniciado! Mantendo o servidor acordado 24/7...");
  await checkDNS();
  await httpKeepAlive();
  await statusCheck();

  setInterval(checkDNS,      15 * 60 * 1000); // DNS a cada 15 min
  setInterval(httpKeepAlive, PING_INTERVAL_MS); // KeepAlive a cada 5 min
  setInterval(statusCheck,   10 * 60 * 1000); // status público a cada 10 min
})();
