const express = require('express');
const rescue = require('express-rescue')
const cors = require('cors')
const {combineTilesJimp} = require('./combine-tiles.js')
const bodyParser = require('body-parser')
const SSE = require('express-sse')
const app = express()
const PORT = '3000'
const sse = new SSE([]);
app.use(cors());
app.use(bodyParser.json({limit: '20000mb'}));
app.use(bodyParser.urlencoded({extended: true}))

async function start() {
    app.post('/backend', rescue(async (req, res, next) => {
        let tiles = await req.body
        try {
            for (let tile of tiles.tiles) {
                tile.buffer = Buffer.from(tile.buffer, 'base64');
            }
            const size = 512
            let imageBuffer = await combineTilesJimp(tiles.tiles, size, size, sse)

            res.send(Buffer.from(imageBuffer))
            res.end();
        } catch (e) {
            console.log(e)
        }
    }))
    app.get('/backend', (req, res) => {
        res.send("Server is running")
    })
    app.use((err, req, res, next) => {
        res.send('error')
    })

    app.get('/events', sse.init);

    //hosting on namecheap do not specify port
    // app.listen()
    app.listen(PORT, () => {
        console.log(`server listening at http://localhost:${PORT}/backend`)
    })

}

start()

