// ==============================
// 🎮 BOT JOGADOR DO ATERNOS
// Nome: AnimeGuardianBot
// Feito por Breno & Sofya 💖
// ==============================

import mineflayer from "mineflayer";

function startBot() {
  const bot = mineflayer.createBot({
    host: "brenothy.aternos.me", // IP sem a porta
    port: 48100, // porta do Aternos
    username: "AnimeGuardianBot", // nome do bot
    version: false, // detecta versão automaticamente
  });

  // Quando o bot conectar
  bot.once("spawn", () => {
    console.log("✅ AnimeGuardianBot entrou no servidor Minecraft!");
    bot.chat("🌸 Olá Breno e Sofya! Estou aqui para manter o servidor acordado 24/7 💖");
  });

  // Mensagens de erro
  bot.on("kicked", (reason) => console.log("⛔ Bot expulso:", reason));
  bot.on("error", (err) => console.log("⚠️ Erro no bot:", err.message));

  // Mantém o bot ativo — se cair, tenta reconectar
  bot.on("end", () => {
    console.log("🔁 Reconectando em 30 segundos...");
    setTimeout(startBot, 30000);
  });
}

startBot();
