const axios = require('axios');

module.exports = {
  route: '/request',
  method: 'post',
  async run (req, res) {
    try {
      let result = await axios(req.body);
      res.json(result).status(200);
    } catch (e) {
      res.json({ error: e }).status(500);
    }
  }
};