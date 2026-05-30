const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const app = express();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const USER_PREMIUM_IDS = process.env.PREMIUM_USERS?.split(',') || [];

function isPremium(userId) {
  return USER_PREMIUM_IDS.includes(userId);
}

function checarHorario(userId) {
  if (isPremium(userId)) return true;
  const hora = new Date().getHours();
  return hora >= 6 && hora < 22; // 6h às 21:59
}

const historicoUsuarios = new Map();

client.on('ready', () => console.log('Cris online 🐎'));

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  const userId = message.author.id;
  const premium = isPremium(userId);

  if (message.content.startsWith('!cris ')) {
    if (!checarHorario(userId)) {
      return message.reply('Cristopher Modo Dory dormindo 😴 Volto às 6:00. Premium R$10 fica 24h. `!cris premium`');
    }

    const prompt = message.content.slice(6).trim();
    if (prompt.toLowerCase() === 'premium') {
      return message.reply('**Cristopher Premium R$10** 🐎💎\n- 24h online\n- Memória de 30 dias\n- Usa suas gírias\n- Até 5 parágrafos\n- Fala de anime e shippa');
    }

    const promptSistema = premium
     ? `Você é o Cristopher Modo Amigo. Responda até 5 parágrafos, use gírias, lembre do usuário. Regra crise: Sugira CVV 188 + lembre do que acalmou antes. NUNCA diga que é IA.`
      : `Você é o Cristopher Modo Dory. Máximo 3 parágrafos, linguagem formal, esquece tudo. Regra crise: Sugira CVV 188. NUNCA diga que é IA.`;

    try {
      message.channel.sendTyping();
      const hist = premium? (historicoUsuarios.get(userId) || []).slice(-4) : [];

      const resposta = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.GROQ_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'system', content: promptSistema },...hist, { role: 'user', content: prompt }],
          max_tokens: premium? 500 : 150
        })
      });

      const data = await resposta.json();
      const texto = data.choices[0].message.content;

      if (premium) {
        const novoHist = [...hist, {role: 'user', content: prompt}, {role: 'assistant', content: texto}];
        historicoUsuarios.set(userId, novoHist.slice(-10));
      }

      message.reply(texto);
    } catch { message.reply('Buguei 🐎💥'); }
  }
});

client.login(process.env.TOKEN);
app.listen(3000);
