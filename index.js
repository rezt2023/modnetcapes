const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let globalCapes = {};

// Agora a rota da API se chama /netcapes
app.get('/netcapes', (req, res) => {
  let responseArray = [];
  for (let uuid in globalCapes) {
    responseArray.push({
      uuid: uuid,
      cape_name: globalCapes[uuid]
    });
  }
  res.json(responseArray);
});

// A rota de salvar também se chama /netcapes
app.post('/netcapes', (req, res) => {
  const { uuid, cape_name } = req.body;
  if (!uuid) return res.status(400).json({ error: 'UUID is required' });

  if (!cape_name || cape_name === '') {
    delete globalCapes[uuid];
  } else {
    globalCapes[uuid] = cape_name;
  }
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
