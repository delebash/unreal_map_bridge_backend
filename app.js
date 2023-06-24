import express from 'express';
import rescue from 'express-rescue'
import cors from 'cors'
import combineTiles from './combine-tiles.js'
import bodyParser from 'body-parser'

const app = express()
import SSE from 'express-sse'

const sse = new SSE([]);
// const {v4: uuidv4} = require('uuid');

app.use(cors());
const port = 3000

app.use(bodyParser.json({limit: '20000mb'}));
app.use(bodyParser.urlencoded({extended: true}))

async function run() {
    app.post('/backend', rescue(async (req, res, next) => {
        let tiles = await req.body
        try {
            for (let tile of tiles.tiles) {
                tile.buffer = Buffer.from(tile.buffer, 'base64');
            }
            const size = 512
            let imageBuffer = await combineTiles(tiles.tiles, size, size, sse)

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

    app.listen(port, () => {
        console.log(`server listening at http://localhost:${port}/backend`)
    })

}

run()
