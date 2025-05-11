const Canvas = require('@napi-rs/canvas'),
      axios  = require('axios');

module.exports = {
  route: '/canvas',
  run: async (req, res) {
    res.send('É isso, e tá tudo bem.');
  }
}

