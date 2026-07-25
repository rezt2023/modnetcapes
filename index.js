const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let globalCapes = {};

// Capas gratuitas/padrões permitidas para todos
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
    "Donator"
]);

// Capas pagas/exclusivas e os UUIDs que possuem permissão de uso (vírgulas corrigidas aqui)
const PAID_CAPES_WHITELIST = {
    "Developer": [
        "7fc49989-b62b-4877-833a-19ced916cf43"
    ],
    "YouTuber": [
        "a1541f0e-a467-403b-bdf2-759cb33647bf"
    ],
    "Donator": [
        "7fc49989-b62b-4877-833a-19ced916cf43",
        "a1541f0e-a467-403b-bdf2-759cb33647bf"
    ]
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

app.get('/netcapes/exclusive', (req, res) => {
  const clientVersion = req.headers['x-mod-version'] || "1.0.0";
  if (clientVersion < "1.1.0") {
    return res.status(426).json({ error: "Outdated version. Please update your mod." });
  }
  res.json(PAID_CAPES_WHITELIST);
});

app.get('/netcapes', (req, res) => {
  const clientVersion = req.headers['x-mod-version'] || "1.0.0";
  if (clientVersion < "1.1.0") {
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
  if (clientVersion < "1.1.0") {
    return res.status(426).json({ error: "Outdated version. Please update your mod." });
  }

  const { uuid, cape_name } = req.body;

  if (!uuid || !UUID_REGEX.test(uuid)) {
    return res.status(400).json({ error: 'Invalid or missing UUID' });
  }

  if (!cape_name || cape_name === '') {
    delete globalCapes[uuid];
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
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Servidor seguro rodando na porta ${PORT}`);
});
