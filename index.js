const express = require('express');
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ==========================================
// CONFIGURAÇÕES DO DISCORD
// ==========================================
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const BOOSTER_CAPE_NAME = "Nitro"; // Capa concedida automaticamente ao dar Boost

// ==========================================
// ARQUIVO DE PERSISTÊNCIA E DADOS LOCAIS
// ==========================================
const DATA_FILE = path.join(__dirname, 'capes_data.json');

let globalCapes = {};
let linkedAccounts = {}; // discordId: { uuid, username }

function loadData() {
    if (fs.existsSync(DATA_FILE)) {
        try {
            const raw = fs.readFileSync(DATA_FILE, 'utf8');
            const data = JSON.parse(raw);
            if (data.globalCapes) globalCapes = data.globalCapes;
            if (data.linkedAccounts) linkedAccounts = data.linkedAccounts;
        } catch (e) {
            console.error("Erro ao carregar capes_data.json:", e);
        }
    }
}

function saveData() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ globalCapes, linkedAccounts }, null, 2));
    } catch (e) {
        console.error("Erro ao salvar capes_data.json:", e);
    }
}

loadData();

const ALLOWED_CAPES = new Set([
    "15th_Anniversary", "2011", "2012", "2013", "2015", "2016", 
    "Bacon", "Birthday", "Cherry_Blossom", "cheapsh0t", 
    "Chinese_Translator", "Christmas", "Classic_Mojang", "Cobalt", 
    "Common", "Copper", "Crafter", "dannyBstyle", "Document", 
    "Followers", "Founders", "Home", "JulianClark", "MCC_15th_Year", 
    "Menace", "Migrator", "Millionth", "Minecraft_Experience", 
    "Moderator", "Mojang_Office", "Mojang_Studios", "Mojang", 
    "Moonlight_Trail", "MrMessiah", "New_Years", "Oxeye", "Pan", 
    "Prismarine", "Purple_Heart", "Realms_Map_Maker", "Scrolls_Champion", 
    "Translator", "Turtle", "Valentine", "Vanilla", 
    "Yearn", "Zombie_Horse", "Developer", "YouTuber",
    "Donator", "Acreano"
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
    ]
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

app.get('/netcapes/exclusive', (req, res) => {
  const clientVersion = req.headers['x-mod-version'] || "1.0.0";
  if (clientVersion < "1.3.0") {
    return res.status(426).json({ error: "Outdated version. Please update your mod." });
  }
  res.json(PAID_CAPES_WHITELIST);
});

app.get('/netcapes', (req, res) => {
  const clientVersion = req.headers['x-mod-version'] || "1.0.0";
  if (clientVersion < "1.3.0") {
    return res.status(426).json({ error: "Outdated version. Please update your mod." });
  }

  let responseArray = [];
  for (let uuid in globalCapes) {
    let capeName = globalCapes[uuid];
    
    if (ALLOWED_CAPES.has(capeName) || (PAID_CAPES_WHITELIST[capeName] && PAID_CAPES_WHITELIST[capeName].includes(uuid))) {
      responseArray.push({
        uuid: uuid,
        cape_name: capeName
      });
    }
  }
  res.json(responseArray);
});

app.post('/netcapes', (req, res) => {
  const clientVersion = req.headers['x-mod-version'] || "1.0.0";
  if (clientVersion < "1.3.0") {
    return res.status(426).json({ error: "Outdated version. Please update your mod." });
  }

  const { uuid, cape_name } = req.body;

  if (!uuid || !UUID_REGEX.test(uuid)) {
    return res.status(400).json({ error: 'Invalid or missing UUID' });
  }

  if (!cape_name || cape_name === '') {
    delete globalCapes[uuid];
    saveData();
    return res.json({ success: true });
  }

  if (PAID_CAPES_WHITELIST[cape_name]) {
    if (!PAID_CAPES_WHITELIST[cape_name].includes(uuid)) {
      return res.status(403).json({ error: 'Forbidden: You do not own this paid cape' });
    }
  } 
  else if (!ALLOWED_CAPES.has(cape_name)) {
    return res.status(403).json({ error: 'Forbidden: Unauthorized cape name' });
  }

  globalCapes[uuid] = cape_name;
  saveData();
  res.json({ success: true });
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
    const commands = [
        new SlashCommandBuilder()
            .setName('vincular')
            .setDescription('Vincula seu nick do Minecraft ao Discord para liberar a capa de Booster.')
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

        linkedAccounts[interaction.user.id] = { uuid, username: nick };
        saveData();

        const member = interaction.member;
        if (member && member.premiumSince) {
            if (PAID_CAPES_WHITELIST[BOOSTER_CAPE_NAME] && !PAID_CAPES_WHITELIST[BOOSTER_CAPE_NAME].includes(uuid)) {
                PAID_CAPES_WHITELIST[BOOSTER_CAPE_NAME].push(uuid);
            }
            return interaction.editReply({ content: `✅ Conta **${nick}** vinculada! Como você já tem Boost, a capa **${BOOSTER_CAPE_NAME}** foi liberada.` });
        }

        return interaction.editReply({ content: `✅ Conta **${nick}** vinculada com sucesso! Ao dar Boost no servidor, a capa será liberada automaticamente.` });
    }
});

discordClient.on('guildMemberUpdate', (oldMember, newMember) => {
    const linked = linkedAccounts[newMember.id];
    if (!linked) return;

    const hadBoost = Boolean(oldMember.premiumSince);
    const hasBoost = Boolean(newMember.premiumSince);

    if (!hadBoost && hasBoost) {
        if (PAID_CAPES_WHITELIST[BOOSTER_CAPE_NAME] && !PAID_CAPES_WHITELIST[BOOSTER_CAPE_NAME].includes(linked.uuid)) {
            PAID_CAPES_WHITELIST[BOOSTER_CAPE_NAME].push(linked.uuid);
            console.log(`[BOOST] Capa liberada para UUID: ${linked.uuid} (${linked.username})`);
        }
    } else if (hadBoost && !hasBoost) {
        if (PAID_CAPES_WHITELIST[BOOSTER_CAPE_NAME]) {
            const index = PAID_CAPES_WHITELIST[BOOSTER_CAPE_NAME].indexOf(linked.uuid);
            if (index !== -1) {
                PAID_CAPES_WHITELIST[BOOSTER_CAPE_NAME].splice(index, 1);
                if (globalCapes[linked.uuid] === BOOSTER_CAPE_NAME) {
                    delete globalCapes[linked.uuid];
                    saveData();
                }
                console.log(`[BOOST REMOVIDO] Capa removida de UUID: ${linked.uuid}`);
            }
        }
    }
});

app.listen(PORT, () => {
  console.log(`Servidor seguro rodando na porta ${PORT}`);
  if (DISCORD_BOT_TOKEN && DISCORD_BOT_TOKEN !== "SEU_TOKEN_DO_BOT_AQUI") {
      discordClient.login(DISCORD_BOT_TOKEN);
  } else {
      console.warn("Aviso: Token do bot não configurado. Funcionalidade de Boost inativa.");
  }
});
