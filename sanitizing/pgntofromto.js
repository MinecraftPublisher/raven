const Chess = require('chess.js').Chess
const fs = require('fs')

console.log('Reading data...')

if (!globalThis['Bun']) globalThis['Bun'] = {}

let COC = 176200
let pgn = fs.readFileSync('filtered.pgn', 'utf-8').split('\n').slice(COC)

function msToTime(duration) {
    let milliseconds = Math.floor((duration % 1000) / 100)
    let seconds = Math.floor((duration / 1000) % 60)
    let minutes = Math.floor((duration / (1000 * 60)) % 60)
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
    let days = Math.floor((duration / (1000 * 60 * 60 * 24)) % 365)

    return days + 'd, ' + hours + 'h, ' + minutes + 'm, ' + seconds + 's, ' + milliseconds + 'ms'
}

console.log('Done reading data.')

let start = +new Date

const ORDER = 2

const COUNTER = 100

import('../engines/raven/q.mjs').then(qd => {
    let q = qd.q(fs.readFileSync('./q.json', 'utf-8'))

    console.log('Starting...')
    pgn.forEach((e, i) => {
        if (i >= COC) {
            if (i % COUNTER === 0) console.time('Part')

            let game = new Chess()
            game.loadPgn(e)
            let _moves = game.history({ verbose: true }).map(j => j.from + j.to)

            let data = _moves
            let states = []

            let o = /*game.isCheckmate()*/true
            for (let move in data) {
                /* if (o) { */
                states.push({
                    i: data.slice(move - ORDER < 0 ? 0 : move - ORDER, move).join(' '),
                    o: data[move]
                })
                // }

                // o = !o
            }

            q.train(states)

            if (i % COUNTER === 0) {
                let ent = ((+new Date) - start) / COUNTER
                let eta = ent * (pgn.length - i)

                console.log('done: ' + i + '/' + (pgn.length + COC) + ' | ' + Math.round((i / (pgn.length + COC)) * 100 * 1000) / 1000 + '% | left: ' + msToTime(eta) + ' | size: ' + Math.floor(JSON.stringify(q.data).length / 1000) / 1000 + 'mb')
                console.timeEnd('Part')

                q.save('q.json')
                fs.writeFileSync('pgntofromto.js', fs.readFileSync('pgntofromto.js', 'utf-8').replaceAll('let COC = ' + COC.toString(), 'let COC = ' + i.toString()))
                start = +new Date
                COC = i
            }

            if ((i + COC) >= 3451135) {
                fs.writeFileSync('parsed.json', JSON.stringify(fromto))
                process.exit(0)
            }
        }
    })
})