// feed it unfiltered pgn, get filtered pgn!!!
const { once } = require('node:events')
const fs = require('fs')
const readline = require('readline')

let output = []

const rl = readline.createInterface({
    input: fs.createReadStream('unfiltered.pgn'),
    crlfDelay: Infinity
})

let i = 0
let i2 = 0

rl.on('line', (line) => {
    i++
    if(i % 10000 === 0) {
        console.clear()
        console.log('line ' + i + ' | took ' + i2)
    }
    if(line.startsWith('1.')) {
        output.push(line)
        i2++
    }
})

once(rl, 'close').then(e => {
    fs.writeFileSync('filtered.pgn', output.join('\n'))
})