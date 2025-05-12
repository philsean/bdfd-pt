const fs = require('fs');
const app = require('../../../index.js');
const { Router } = require('express');
const router = Router();

for (const f of fs.readdirSync('./src/api/v1/endpoints/')) {
  if (f.endsWith('.js')) {
    let endpoint = require(`./endpoints/${f}`);
    point(endpoint);
  } else for (const ff of fs.readdirSync(`./src/api/v1/endpoints/${f}`).filter(x => x.endsWith('.js'))) {
    point(require(`./endpoints/${f}/${ff}`));
  }
}

function point (p) {
  if (typeof p === 'array') return p.map(pp => point(pp));
  router[p.method || 'get'](p.route, (req, res) => {
    let params = (p.params || []).filter((pr) => (pr.required || true) && !req.params[pr.name]),
    query = (p.query || []).filter((pr) => (pr.required || true) && !req.query[pr.name]),
    headers = (p.headers || []).filter((pr) => (pr.required || true) && !req.headers[pr.name]),
    body = (p.body || []).filter((pr) => (pr.required || true) && !req.body[pr.name]);
    // console.log(req, '\n\n', headers);
    if (params.length > 0) return res.status(400).json({ error: `(400 - Bad Request) › Não foi possível localizar nos 'parâmetros': ${params.map(x => x.name).join(', ')}` });
    if (query.length > 0) return res.status(400).json({ error: `(400 - Bad Request) › Não foi possível localizar nas 'query': ${query.map(x => x.name).join(', ')}` });
    if (headers.length > 0) return res.status(400).json({ error: `(400 - Bad Request) › Não foi possível localizar nas 'headers': ${headers.map(x => x.name).join(', ')}` });
    if (body.length > 0) return res.status(400).json({ error: `(400 - Bad Request) › Não foi possível localizar no 'body': ${body.map(x => x.name).join(', ')}` });
    p.run(req, res, app);
  });
}

module.exports = router;
