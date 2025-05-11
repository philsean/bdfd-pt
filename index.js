const express = require('express')
      axios   = require('axios')
      path    = require('path')
      app     = express();

app.get('/', (req, res) => {
  res.send('<h1>E é isso veyr, vivências veyr</h1>');
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`[ Express ] › All right! ( ${process.env.PORT} )`);
});

module.exports = app;
