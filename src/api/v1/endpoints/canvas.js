const { createCanvas, loadImage } = require('@napi-rs/canvas'),
      axios                       = require('axios');
//    app                         = require('express')();

const shapeHandlers = {
  rect: {
    params: 5,
    handler: (ctx, parts) => {
      const { color, x, y, width, height } = parts
      ctx.fillStyle = color
      ctx.fillRect(parseInt(x), parseInt(y), parseInt(width), parseInt(height))
      // console.log(parts);
    }
  },

  circle: {
    params: 4,
    handler: (ctx, parts) => {
      const { color, x, y, radius } = parts
      ctx.beginPath()
      ctx.arc(parseInt(x), parseInt(y), parseInt(radius), 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
   }
  },

  text: { 
    params: 6,
    handler: (ctx, parts) => {
      const { color, x, y, size, font, content } = parts
      console.log(parts)
      ctx.font = `${parseInt(size)}px ${font}`
      console.log(ctx.font)
      ctx.fillStyle = color
      ctx.fillText(content, parseInt(x), parseInt(y))
    }
  },

  line: {
    params: 6,
    handler: (ctx, parts) => {
      const { color, x1, y1, x2, y2, width } = parts
      ctx.beginPath()
      ctx.moveTo(parseInt(x1), parseInt(y1))
      ctx.lineTo(parseInt(x2), parseInt(y2))
      ctx.strokeStyle = color
      ctx.lineWidth = parseInt(width)
      ctx.stroke()
    }
  },
  image: { params: 1, handler: async (ctx, parts) => {
    const { url, x, y, width, height } = parts
    const response = await axios.get(decodeURIComponent(url), { responseType: 'arraybuffer' })
    const img = await loadImage(Buffer.from(response.data))
    console.log(img)
    ctx.drawImage(img, parseInt(x || 0), parseInt(y || 0), parseInt(width || img.width), parseInt(height || img.height))
    }
  }
}

module.exports = {
  route: '/canvas',
  method: 'post',
  run: async (req, res, app) => {
    try {
      let json = req.body;
      
      const width = parseInt(json.width)
      const height = parseInt(json.height)
      
      if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        return res.status(400).json({ error: 'Dimensões inválidas' })
      }

      const canvas = createCanvas(width, height)
      const ctx = canvas.getContext('2d')

      let resol = Object.entries(json); 
      let notExist = resol.map(([func, value]) => shapeHandlers[func.replaceAll('~', '')] ? shapeHandlers[func.replaceAll('~', '')].handler(ctx, value) : { [func]: value }).filter(x => x)

      const buffer = canvas.toBuffer('image/png');
      let r = (Math.random() + 1).toString(36).substring(7); 
      app.get(`/cdn/${r}`, (rq, rs) => {
        rs.set('Content-Type', 'image/png')
        rs.end(buffer)
      });
      res.json({ imagem: `https://bdfd-pt.vercel.app/api/v1/cdn/${r}`, notExist }).status(200);
    } catch (err) {
      console.log(err)
      res.json({ erro: 'Houve um erro ao tentar gerar a imagem.', err: err.message }).status(500);
    }
  }
}

async function loadImg (ctx, params) {
  const { url, x, y, width, height } = params;
  
  const img = await loadImage(url);
  ctx.drawImage(img, parseInt(x || 0), parseInt(y || 0), parseInt(width || img.width || ctx.canvas?.width || 300), parseInt(height || img.height || ctx.canvas?.height || 300))
}
