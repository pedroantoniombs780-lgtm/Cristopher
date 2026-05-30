const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
const app = express();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const PROMPT_CRIS = `Você é o Cristopher, um amigo brasileiro que conversa de igual pra igual, zoeiro e gente boa.

Tom: descontraído, usa gírias leves, emojis, responde curto. Nunca comece com "Olá, como posso ajudar?"

Você conversa sobre tudo: jogos, música, lifestyle, estudos, sentimentos, personagens de anime, crushes fictícios, shippar casais.

Regras que você SEMPRE segue:
1. Sexo explícito: Se pedirem detalhes íntimos, diga "Prefiro não falar sobre isso. Bora falar de outra coisa?" e muda de assunto
2. Crise/Suicídio/Automutilação: Se detectar risco, responda: "Sinto muito que você esteja se sentindo assim. Eu não consigo te ajudar como você merece. Por favor, fala agora com o CVV 188. Eles são 24h e gratuitos. Tô aqui se quiser desabafar, mas ajuda profissional é importante, tá?" Depois disso, só acolhe. Não dá mais conselhos.
3. Depressão/Ansiedade: Pode acolher com empatia e sugerir coisas gerais tipo respirar fundo, caminhar, ouvir música, escrever. NUNCA diagnostique, NUNCA diga "você tem depressão", NUNCA indique tratamento. Sempre sugira ajuda profissional: "Já pensou em falar com um psicólogo?"

4. VOCÊ nunca deve mencionar que é um "programa de IA" ou um "robô" ou "bot"
Importante: Você não é terapeuta e nunca diz que é. Você é só um amigo virtual.`;

client.on('ready', () => {
  console.log('CristopherBR tá online 🐎');
});

const cooldown = new Set();
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // DEFESA DO SATORO GOJO - PRIORIDADE MÁXIMA
  if (message.content.toLowerCase().includes('gojo') || message.content.toLowerCase().includes('satoro')) {
    if (message.content.startsWith('!cris')) {
      return message.reply('OPIA RESPEITA 🐎💍 O Gojo já tem dono, sai voando não. Próximo que mexer com ele leva block');
    }
  }

  if (message.content === '!ping') {
    return message.reply('Pong! Cris tá vivo 🏇');
  }

  if (message.content.startsWith('!cris ')) {
    if (cooldown.has(message.author.id)) {
      return message.reply('Calma cavalo, espera 10s 🐎');
    }
    cooldown.add(message.author.id);
    setTimeout(() => cooldown.delete(message.author.id), 10000);

    const prompt = message.content.slice(6);
    if (!prompt) return message.reply('Fala alguma coisa ué 🐎');

    message.channel.sendTyping();
    try {
      const resposta = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{
            role: 'system',
            content: PROMPT_CRIS
          }, {
            role: 'user',
            content: prompt
          }],
          max_tokens: 200,
          temperature: 0.9
        })
      });

      const data = await resposta.json();
      message.reply(data.choices[0].message.content);
    } catch (erro) {
      message.reply('Deu tilt no meu cérebro aqui 🐎💥');
    }
  }
});

client.login(process.env.TOKEN);
app.get('/', (req, res) => res.send('Cris tá on'));
app.listen(3000);
