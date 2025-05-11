const { createCanvas, loadImage, Image } = require('@napi-rs/canvas'),
      axios  = require('axios');

const shapeHandlers = {
  rect: {
    params: 5,
    handler: (ctx, parts) => {
      const [color, x, y, w, h] = parts
      ctx.fillStyle = color
      ctx.fillRect(parseInt(x), parseInt(y), parseInt(w), parseInt(h))
      // console.log(parts);
    }
  },

  circle: {
    params: 4,
    handler: (ctx, parts) => {
      const [color, x, y, radius] = parts
      ctx.beginPath()
      ctx.arc(parseInt(x), parseInt(y), parseInt(radius), 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()
   }
  },

  text: { 
    params: 6,
    handler: (ctx, parts) => {
      const [color, x, y, size, font, content] = parts
      ctx.font = `${parseInt(size)}px ${font}`
      ctx.fillStyle = color
      ctx.fillText(decodeURIComponent(content), parseInt(x), parseInt(y))
    }
  },

  line: {
    params: 6,
    handler: (ctx, parts) => {
      const [color, x1, y1, x2, y2, width] = parts
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
      const width = parseInt(req.query.width)
      const height = parseInt(req.query.height)
      
      if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        return res.status(400).json({ error: 'Dimensões inválidas' })
      }

      const canvas = createCanvas(width, height)
      const ctx = canvas.getContext('2d')

      for (const command of Object.keys(req.query)) {
        if (shapeHandlers[command]) {
          const parts = req.query[command].split(',');
          // console.log(req.query, '\n', req.query[command]);
            /*if (parts.length < shapeHandlers[command].params) {
              return res.status(400).json({ error: `Parâmetros insuficientes para ${command}` });
            }*/
          shapeHandlers[command].handler(ctx, parts)
          // console.log(command, '\n', parts);
        }
      }

      const buffer = canvas.toBuffer('image/png')
      res.set('Content-Type', 'image/png')
      res.end(buffer)
      
    } catch (err) {
      res.json({ erro: 'Houve um erro ao tentar gerar a imagem.', err }).status(500);
    }
  }
}

