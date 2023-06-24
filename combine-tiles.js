'use strict'

import {minBy, maxBy, sortBy} from 'lodash-es';
import Jimp from 'jimp';
let totalCount = 0
export default async function combineTilesJimp(tiles, tWidth, tHeight, sse) {

    totalCount = tiles.length
    const offsetX = minBy(tiles, tile => tile.x).x
    const offsetY = minBy(tiles, tile => tile.y).y

    const makeRelative = (tile) => ({
        x: tile.x - offsetX,
        y: tile.y - offsetY,
        buffer: tile.buffer
    })

    const index = sortBy(tiles.map(makeRelative), ['y', 'x'])
    const cols = 1 + maxBy(index, tile => tile.x).x
    const rows = 1 + maxBy(index, tile => tile.y).y
    const w = tWidth * cols
    const h = tHeight * rows


    let image = await Jimp.read(Buffer.from(index[0].buffer))
    image.background(0xFFFFFFFF)
    image.resize(w, h);
    let compImage = await CompositeImg(image, index, tHeight, tWidth, sse)

    let buffer = await compImage.getBufferAsync(Jimp.MIME_PNG);
    return buffer


}


async function CompositeImg(image, index, tHeight, tWidth, sse) {
    try {
        let count = 1
        for (let data of index) {
            let buffer = Buffer.from(data.buffer)
            let y = data.y * tHeight
            let x = data.x * tWidth
            let newImage = await Jimp.read(buffer)
            image.composite(newImage, x, y)
            try {
                    sse.send({count:count,totalCount:totalCount});
            } catch (e) {
            }
            count++
        }
        return image
    } catch (e) {
        console.log(e)
    }
}

