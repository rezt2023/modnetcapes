let globalCapes = {};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    let responseArray = [];
    for (let uuid in globalCapes) {
      responseArray.push({
        uuid: uuid,
        cape_name: globalCapes[uuid]
      });
    }
    return res.status(200).json(responseArray);
  }

  if (req.method === 'POST') {
    const { uuid, cape_name } = req.body;
    if (!uuid) {
      return res.status(400).json({ error: 'UUID is required' });
    }

    if (!cape_name || cape_name === '') {
      delete globalCapes[uuid];
    } else {
      globalCapes[uuid] = cape_name;
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}