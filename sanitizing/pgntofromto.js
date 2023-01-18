const Chess = require('chess.js').Chess
const fs = require('fs')

console.log('Reading data...')

let pgn = fs.readFileSync('filtered.pgn', 'utf-8').split('\n')

console.log('Done reading data.')

let i = 0
let start = +new Date

let promises = []

const ORDER = 2

import('../engines/raven/q.mjs').then(qd => {
    console.log('Starting...')
    let q = qd.q(fs.readFileSync('../q.json', 'utf-8'))

    pgn.forEach(e => {
        let game = new Chess()
        game.loadPgn(e)
        let _moves = game.history({ verbose: true }).map(j => j.from + j.to)
        q.train

        let data = _moves
        game = new Chess()
        let states = []

        let o = game.isCheckmate()
        for (let move in data) {
            if (o) {
                states.push({
                    i: data.slice(move - ORDER < 0 ? 0 : move - ORDER, move).join(' '),
                    o: data[move]
                })
            }

            o = !o
        }

        q.train(states)

        i++

        if (i % 2 === 0) {
            let ent = i / ((+new Date) - start)
            let eta = ent * (pgn.length - i)
            eta = Math.round(eta / 60 / 60)

            console.clear()
            console.log('done: ' + i + '/' + pgn.length + ' | ' + Math.round((i / pgn.length) * 100) + '% | left: ' + eta + 'h')
            console.log('size: ' + Math.floor(JSON.stringify(q.data).length / 10000) / 100 + 'mb')

            q.save('temp.json')
        }

        if (i === 3451135) {
            fs.writeFileSync('parsed.json', JSON.stringify(fromto))
            process.exit(1)
        }
    })
})