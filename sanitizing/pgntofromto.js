const Chess = require('chess.js').Chess
const fs = require('fs')

console.log('Reading data...')

if (!globalThis['Bun']) globalThis['Bun'] = {}

let COC = 507000
let pgn = fs.readFileSync('filtered.pgn', 'utf-8').split('\n').slice(COC)
const LNGTH = pgn.length

let chunks = fs.readdirSync('qs/').length

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

let pushTimes = []

const ORDER = 2

const COUNTER = 100

import('../engines/raven/q.mjs').then(qd => {
    let q = qd.q(fs.readFileSync('./q.json', 'utf-8'))

    console.log('Starting...')
    pgn.forEach((e, i) => {
        if (i >= COC) {
            if (i % COUNTER === 0) {
                start = +new Date
                console.time('part')
            }

            //[time] console.time('pgn')
            let game = new Chess()
            game.loadPgn(e)
            let _moves = game.history({ verbose: true }).map(j => j.from + j.to + (j.promotion || ''))
            //[time] console.timeEnd('pgn')

            //[time] console.time('state')
            let data = _moves
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
            //[time] console.timeEnd('state')

            //[time] console.time('train')
            q.train(states)
            //[time] console.timeEnd('train')

            if (i % COUNTER === 0) {
                console.clear()
                //[time] console.time('eta')

                console.log('done: ' + i + '/' + (LNGTH) + ' | ' + Math.round((i / (LNGTH)) * 100 * 1000) / 1000 + '% | chunks: ' + chunks)

                COC = i

                // I CALL THIS:
                // THE GREAT PURGE!!!!
                if((+new Date) - start > 3) {
                    fs.copyFileSync('q.json', 'qs/q' + Math.floor(Math.random() * 100000) + '.json')
                    q = qd.q([])
                    chunks = fs.readdirSync('qs/').length
                }

                console.timeEnd('part')
                // process.exit(0)
            }

            if(i % (COUNTER * 5) === 0) {
                console.log('SAVE SAVE SAVE!!!!')
                fs.writeFileSync('pgntofromto.js', fs.readFileSync('pgntofromto.js', 'utf-8').replaceAll(/let COC = \d+/g, 'let COC = ' + i.toString()))
                q.save('q.json')
            }

            if ((i + COC) >= 3451135) {
                q.save('q.json')
                process.exit(0)
            }
        }
    })
})