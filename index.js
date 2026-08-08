const express = require('express');
const { MongoClient } = require('mongodb');
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ==========================================
// CONFIGURAÇÕES DO DISCORD E BANCO DE DADOS
// ==========================================
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const MONGO_URI = process.env.MONGO_URI;
const BOOSTER_CAPE_NAME = "Nitro"; 

// Conexão com o MongoDB
let db, globalCapesCollection, linkedAccountsCollection, boostersCollection;

async function connectDB() {
    if (!MONGO_URI) {
        console.error("❌ ERRO: A variável de ambiente MONGO_URI não está configurada!");
        process.exit(1);
    }
    try {
        const client = new MongoClient(MONGO_URI, {
            tls: true,
            tlsAllowInvalidCertificates: true
        });
        await client.connect();
        db = client.db("netcapes_db");
        globalCapesCollection = db.collection("globalCapes");
        linkedAccountsCollection = db.collection("linkedAccounts");
        boostersCollection = db.collection("boosters");
        console.log("✅ Conectado ao MongoDB Atlas com sucesso!");
    } catch (e) {
        console.error("Erro ao conectar ao MongoDB:", e);
        process.exit(1);
    }
}

const ALLOWED_CAPES = new Set([
    "Amethyst", "Axolotl", "Bee", "Blaze", "Bread", "Cake", 
    "Cherry", "CreeperCoin", "Discord", "Dog", 
    "Duck", "Feather", "Frog", "Ghast", 
    "Glass", "Gold", "Ho", "Kitty", "Landscape", 
    "Lunar", "Migrator_Lava", "Night", "Panda", "Pixelcat", 
    "Prismarine", "Red_Flower", "Retro", "Rooster", 
    "Sculk", "Sea", "Shark", "Simpson", 
    "Sky", "Snow", "Sonic", "Star", "Sunflower", 
    "Void", "Waffle", "Waters", "Watermelon", 
    "Wheat", "Wings", "Wood", "Brasil"
]);

const PAID_CAPES_WHITELIST = {
    "Developer": [
        "7fc49989-b62b-4877-833a-19ced916cf43"
    ],
    "YouTuber": [
        "7fc49989-b62b-4877-833a-19ced916cf43",
        "a1541f0e-a467-403b-bdf2-759cb33647bf",
        "391d0bc2-1210-402e-88d4-063a1d30dc7c"
    ],
    "Donator": [
        "7fc49989-b62b-4877-833a-19ced916cf43",
        "a1541f0e-a467-403b-bdf2-759cb33647bf",
        "391d0bc2-1210-402e-88d4-063a1d30dc7c"
    ],
    "Acreano": [
        "7fc49989-b62b-4877-833a-19ced916cf43",
        "a1541f0e-a467-403b-bdf2-759cb33647bf",
        "391d0bc2-1210-402e-88d4-063a1d30dc7c"
    ],
    "Pikachu": [
        "7fc49989-b62b-4877-833a-19ced916cf43",
        "a1541f0e-a467-403b-bdf2-759cb33647bf",
        "391d0bc2-1210-402e-88d4-063a1d30dc7c"
    ],
    "Cat": [
        "7fc49989-b62b-4877-833a-19ced916cf43",
        "a1541f0e-a467-403b-bdf2-759cb33647bf",
        "391d0bc2-1210-402e-88d4-063a1d30dc7c"
    ],
    "BlackFlower": [
        "7fc49989-b62b-4877-833a-19ced916cf43",
        "a1541f0e-a467-403b-bdf2-759cb33647bf",
        "391d0bc2-1210-402e-88d4-063a1d30dc7c"
    ],
    "Death_Note": [
        "7fc49989-b62b-4877-833a-19ced916cf43",
        "a1541f0e-a467-403b-bdf2-759cb33647bf",
        "391d0bc2-1210-402e-88d4-063a1d30dc7c"
    ],
    "Water": [
        "7fc49989-b62b-4877-833a-19ced916cf43",
        "a1541f0e-a467-403b-bdf2-759cb33647bf",
        "391d0bc2-1210-402e-88d4-063a1d30dc7c"
    ],
    "Cookie": [
        "7fc49989-b62b-4877-833a-19ced916cf43",
        "a1541f0e-a467-403b-bdf2-759cb33647bf",
        "391d0bc2-1210-402e-88d4-063a1d30dc7c"
    ],
    "Bro": [
        "7fc49989-b62b-4877-833a-19ced916cf43",
        "a1541f0e-a467-403b-bdf2-759cb33647bf",
        "391d0bc2-1210-402e-88d4-063a1d30dc7c"
    ],
    "PI": [
        "7fc49989-b62b-4877-833a-19ced916cf43",
        "a1541f0e-a467-403b-bdf2-759cb33647bf",
        "391d0bc2-1210-402e-88d4-063a1d30dc7c"
    ],
    "Sakura_Black": [
        "7fc49989-b62b-4877-833a-19ced916cf43",
        "a1541f0e-a467-403b-bdf2-759cb33647bf",
        "391d0bc2-1210-402e-88d4-063a1d30dc7c"
    ],
    "UuU": [
        "7fc49989-b62b-4877-833a-19ced916cf43",
        "a1541f0e-a467-403b-bdf2-759cb33647bf",
        "391d0bc2-1210-402e-88d4-063a1d30dc7c"
    ],
    "Diamond_Sword": [
        "7fc49989-b62b-4877-833a-19ced916cf43",
        "a1541f0e-a467-403b-bdf2-759cb33647bf",
        "391d0bc2-1210-402e-88d4-063a1d30dc7c"
    ],
    "Kirby": [
        "7fc49989-b62b-4877-833a-19ced916cf43",
        "a1541f0e-a467-403b-bdf2-759cb33647bf",
        "391d0bc2-1210-402e-88d4-063a1d30dc7c"
    ],
    "SmilePink": [
        "7fc49989-b62b-4877-833a-19ced916cf43",
        "a1541f0e-a467-403b-bdf2-759cb33647bf",
        "391d0bc2-1210-402e-88d4-063a1d30dc7c"
    ],
    "Flower": [
        "7fc49989-b62b-4877-833a-19ced916cf43",
        "a1541f0e-a467-403b-bdf2-759cb33647bf",
        "391d0bc2-1210-402e-88d4-063a1d30dc7c"
    ],
    "Twitch": [
        "7fc49989-b62b-4877-833a-19ced916cf43",
        "a1541f0e-a467-403b-bdf2-759cb33647bf",
        "391d0bc2-1210-402e-88d4-063a1d30dc7c"
    ],
    "CatGirl": [
        "7fc49989-b62b-4877-833a-19ced916cf43",
        "a1541f0e-a467-403b-bdf2-759cb33647bf",
        "391d0bc2-1210-402e-88d4-063a1d30dc7c"
    ],
    "Vape_V4": [
        "7fc49989-b62b-4877-833a-19ced916cf43",
        "a1541f0e-a467-403b-bdf2-759cb33647bf",
        "391d0bc2-1210-402e-88d4-063a1d30dc7c"
    ]
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

app.get('/', (req, res) => {
    res.status(200).send('NetCapes API & Bot estao online!');
});

app.get('/netcapes/exclusive', (req, res) => {
  const clientVersion = req.headers['x-mod-version'] || "1.0.0";
  if (clientVersion < "1.3.2") {
    return res.status(426).json({ error: "Outdated version. Please update your mod." });
  }
  res.json(PAID_CAPES_WHITELIST);
});

app.get('/netcapes', async (req, res) => {
  const clientVersion = req.headers['x-mod-version'] || "1.0.0";
  if (clientVersion < "1.3.2") {
    return res.status(426).json({ error: "Outdated version. Please update your mod." });
  }

  try {
    const globalCapes = await globalCapesCollection.find({}).toArray();
    let responseArray = [];

    for (let item of globalCapes) {
      let uuid = item.uuid;
      let capeName = item.cape_name;
      
      // Validação flexível e segura para garantir que o mod aceite a capa listada
      const isAllowed = Array.from(ALLOWED_CAPES).some(c => c.toLowerCase() === capeName.toLowerCase());
      
      let isPaidAuthorized = false;
      for (const [cName, uuids] of Object.entries(PAID_CAPES_WHITELIST)) {
        if (cName.toLowerCase() === capeName.toLowerCase() && uuids.includes(uuid)) {
          isPaidAuthorized = true;
          break;
        }
      }

      if (isAllowed || isPaidAuthorized) {
        responseArray.push({
          uuid: uuid,
          cape_name: capeName
        });
      }
    }
    res.json(responseArray);
  } catch (e) {
    res.status(500).json({ error: "Erro interno ao buscar capas" });
  }
});

app.post('/netcapes', async (req, res) => {
  const clientVersion = req.headers['x-mod-version'] || "1.0.0";
  if (clientVersion < "1.3.2") {
    return res.status(426).json({ error: "Outdated version. Please update your mod." });
  }

  const { uuid, cape_name } = req.body;

  if (!uuid || !UUID_REGEX.test(uuid)) {
    return res.status(400).json({ error: 'Invalid or missing UUID' });
  }

  try {
    if (!cape_name || cape_name === '') {
      await globalCapesCollection.deleteOne({ uuid });
      return res.json({ success: true });
    }

    // Validação flexível para capas públicas/livres
    const isAllowed = Array.from(ALLOWED_CAPES).some(c => c.toLowerCase() === cape_name.toLowerCase());
    if (isAllowed) {
      await globalCapesCollection.updateOne(
        { uuid },
        { $set: { cape_name } },
        { upsert: true }
      );
      return res.json({ success: true });
    }

    // Validação das capas pagas restantes
    let isAuthorized = false;
    for (const [cName, uuids] of Object.entries(PAID_CAPES_WHITELIST)) {
      if (cName.toLowerCase() === cape_name.toLowerCase() && uuids.includes(uuid)) {
        isAuthorized = true;
        break;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Forbidden: You do not own this paid cape' });
    }

    await globalCapesCollection.updateOne(
      { uuid },
      { $set: { cape_name } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Erro interno ao salvar capa" });
  }
});

// ==========================================
// INTEGRAÇÃO DO BOT DO DISCORD
// ==========================================

const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

async function fetchUUIDFromMojang(username) {
    try {
        const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);
        if (response.status === 200) {
            const data = await response.json();
            const raw = data.id;
            return `${raw.substring(0,8)}-${raw.substring(8,12)}-${raw.substring(12,16)}-${raw.substring(16,20)}-${raw.substring(20)}`;
        }
    } catch (e) {
        console.error("Erro ao buscar UUID na Mojang:", e);
    }
    return null;
}

async function registerSlashCommands() {
    if (!DISCORD_BOT_TOKEN || !DISCORD_CLIENT_ID || !GUILD_ID) return;
    const commands = [
        new SlashCommandBuilder()
            .setName('vincular')
            .setDescription('Vincula seu nick do Minecraft ao Discord.')
            .addStringOption(option => 
                option.setName('nick')
                    .setDescription('Seu nick exato do Minecraft')
                    .setRequired(true))
    ];

    const rest = new REST().setToken(DISCORD_BOT_TOKEN);
    try {
        await rest.put(
            Routes.applicationGuildCommands(DISCORD_CLIENT_ID, GUILD_ID),
            { body: commands }
        );
        console.log("Comando /vincular registrado no Discord com sucesso!");
    } catch (error) {
        console.error("Erro ao registrar comandos do Discord:", error);
    }
}

discordClient.on('ready', () => {
    console.log(`Bot do Discord conectado como: ${discordClient.user.tag}`);
    registerSlashCommands();
});

discordClient.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'vincular') {
        await interaction.deferReply({ ephemeral: true });

        const nick = interaction.options.getString('nick');
        const uuid = await fetchUUIDFromMojang(nick);

        if (!uuid) {
            return interaction.editReply({ content: `❌ Conta de Minecraft **${nick}** não encontrada.` });
        }

        await linkedAccountsCollection.updateOne(
            { discordId: interaction.user.id },
            { $set: { uuid, username: nick } },
            { upsert: true }
        );

        const member = interaction.member;
        if (member && member.premiumSince) {
            await boostersCollection.updateOne(
                { uuid },
                { $set: { discordId: interaction.user.id } },
                { upsert: true }
            );
        }

        return interaction.editReply({ content: `✅ Conta **${nick}** vinculada com sucesso!` });
    }
});

discordClient.on('guildMemberUpdate', async (oldMember, newMember) => {
    const linked = await linkedAccountsCollection.findOne({ discordId: newMember.id });
    if (!linked) return;

    const hadBoost = Boolean(oldMember.premiumSince);
    const hasBoost = Boolean(newMember.premiumSince);

    if (!hadBoost && hasBoost) {
        await boostersCollection.updateOne(
            { uuid: linked.uuid },
            { $set: { discordId: newMember.id } },
            { upsert: true }
        );
    } else if (hadBoost && !hasBoost) {
        await boostersCollection.deleteOne({ uuid: linked.uuid });
    }
});

async function start() {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Servidor seguro rodando na porta ${PORT}`);
        if (DISCORD_BOT_TOKEN && DISCORD_BOT_TOKEN !== "SEU_TOKEN_DO_BOT_AQUI") {
            discordClient.login(DISCORD_BOT_TOKEN);
        } else {
            console.warn("Aviso: Token do bot não configurado.");
        }
    });
}

start();
