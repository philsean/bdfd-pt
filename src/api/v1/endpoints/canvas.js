const { createCanvas, loadImage, Image } = require('@napi-rs/canvas'),
      axios  = require('axios');

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
      ctx.font = `${parseInt(size)}px ${font}`
      ctx.fillStyle = color
      ctx.fillText(decodeURIComponent(content), parseInt(x), parseInt(y))
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
  image: { params: 1, handler: loadImg }
}

module.exports = {
  route: '/canvas',
  run: async (req, res) => {
    try {
      let json = JSON.parse(decodeURIComponent(req.query.json) || req.header.json);
      
      const width = parseInt(json.width)
      const height = parseInt(json.height)
      
      if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        return res.status(400).json({ error: 'Dimensões inválidas' })
      }

      const canvas = createCanvas(width, height)
      const ctx = canvas.getContext('2d')

      let resol = Object.entries(json); 
      resol.map(([func, value]) => shapeHandlers[func] ? shapeHandlers[func].handler(ctx, value) : func)

      const buffer = canvas.toBuffer('image/png')
      res.set('Content-Type', 'image/png')
      res.end(buffer)
      
    } catch (err) {
      console.log(err)
      res.json({ erro: 'Houve um erro ao tentar gerar a imagem.', err: err.message }).status(500);
    }
  }
}

async function loadImg (ctx, params) {
  const [url, x, y, w, h] = params;
  
  const resp = await axios(url);
  const img = new Image();
  img.src = Buffer.from(resp.data);
  
  ctx.drawImage(img, parseInt(x || 0), parseInt(y || 0), parseInt(w || img.width || ctx.canvas?.width || 300), parseInt(h || img.height ||ctx.canvas.height || 300))
}
