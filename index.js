const express = require('express'),
      axios   = require('axios'),
      path    = require('path'),
      app     = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

for (const v of fs.readdirSync('./src/api/')) {
  let api = require(`./src/api/${v}/index.js`);
  app.use(`/api/${v}`, api);
}

app.get('/', (req, res) => {
  res.send('<h1>E é isso veyr, vivências veyr</h1>');
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`[ Express ] › All right! ( ${process.env.PORT || 5000} )`);
});

module.exports = app;
