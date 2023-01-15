import { closest } from 'fastest-levenshtein'
import * as fs from 'fs'

let seed = 0
function mulberry32(a2 = +new Date) {
    let a = a2 * Math.random() * seed++
    let t = a += 0x6D2B79F5
    t = Math.imul(t ^ t >>> 15, t | 1)
    t ^= t + Math.imul(t ^ t >>> 7, t | 61)
    return ((t ^ t >>> 14) >>> 0) / 4294967296
}

const log = (t) => t.startsWith('[INFO] ') ? fs.writeFileSync('info.txt', fs.readFileSync('info.txt', 'utf-8') + '\n' + t) : fs.writeFileSync('out.txt', fs.readFileSync('out.txt', 'utf-8') + '\n' + t)

/*
 * q uses a key-value pair system to store 
 */

const fillter = ((f) => f.filter(e => e.i.length === 0 ? true : f.filter(j => e.i === j.i && e.o === j.o).length === 1))

export const q = ((data) => {
    const THIS = {}

    // allocate data
    THIS.data = (typeof data === typeof 'hi' ? JSON.parse(data) : data) || []

    // save-load functions
    THIS.load = ((file) => THIS.data = JSON.parse(fs.readFileSync(file, 'utf-8')))
    THIS.save = ((file) => fs.writeFileSync(file, JSON.stringify(THIS.data)))

    // q-specific functions
    THIS.train = ((data) => {
        let d = typeof data === typeof [] ? data : [data]
        THIS.data = [...THIS.data, ...d]
        // uncomment to disable often plays!
        // THIS.data = fillter(THIS.data)
    })
    THIS.run = ((input) => {
        let output = THIS.data.filter(e => e.i == input)
        // console.log(output)
        if (output.length > 1) output = output[Math.floor(mulberry32() * output.length)].i
        else if (output.length == 1) output = output[0].i
        else output = closest(input, THIS.data.map(e => e['i']))

        return THIS.data[THIS.data.map(e => e['i']).indexOf(output)]['o']
    })

    return THIS
})