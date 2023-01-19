const Chess = require('chess.js').Chess
const fs = require('fs')

console.log('Reading data...')

if (!globalThis['Bun']) globalThis['Bun'] = {}

let COC = 403668
let pgn = fs.readFileSync('filtered.pgn', 'utf-8').split('\n').slice(COC)

console.log('Done reading data.')

let i = 0
let start = +new Date

let promises = []

const ORDER = 2

import('../engines/raven/q.mjs').then(qd => {
    console.log('Starting...')
    let q = qd.q(fs.readFileSync('./temp.json', 'utf-8'))

    pgn.forEach(e => {
        console.time('Part')

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

        i++

        let ent = (COC + i) / ((+new Date) - start)
        let eta = ent * ((pgn.length + COC) - i)
        eta = eta / 3600

        console.log('done: ' + (i + COC) + '/' + (pgn.length + COC) + ' | ' + (((i + COC) / (pgn.length + COC)) * 100) + '% | left: ' + eta + ' h | size: ' + (JSON.stringify(q.data).length / 1000000) + 'mb')
        console.timeEnd('Part')

        if(i % 100 === 0) q.save('temp.json')
        fs.writeFileSync('pgntofromto.js', fs.readFileSync('pgntofromto.js', 'utf-8').replaceAll('let COC = ' + COC.toString(), 'let COC = ' + (i + COC).toString()))
        COC += i

        if (i === 3451135) {
            fs.writeFileSync('parsed.json', JSON.stringify(fromto))
            process.exit(0)
        }
    })
})