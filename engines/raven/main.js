#!/usr/bin/env node

/**
 * AVAILABLE FLAGS:
 * flag.log -> Logs output to `out.txt` and `info.txt`
 * flag.stats -> Write statistics (predicted and random) to `stats.json`
 * floag.board -> Write the chess board to `board.txt`
 */

const Q_DATA = ``

import { Chess } from 'chess.js'
import { q } from './q.mjs'
//import { mve } from './prc.js'
import * as readline from 'readline'
import * as fs from 'fs'

// placeholder for real prc cus i was too lazy to implement it :)
const mve = ((t) => t)

console.log('Raven uci engine')

const log = (t) => {
    if (process.argv.includes('flag.log')) t.startsWith('[INFO] ') ? fs.writeFileSync('info.txt', fs.readFileSync('info.txt', 'utf-8') + '\n' + t) : fs.writeFileSync('out.txt', fs.readFileSync('out.txt', 'utf-8') + '\n' + t)
}

const wBoard = (() => {
    if (process.argv.includes('flag.board')) fs.writeFileSync('board.txt', mve(game.ascii()))
})

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

let game = new Chess()

const parseVerbose = ((e) => {
    let promotion = e.length === 5
    if (promotion) {
        return {
            from: e.substring(0, 2),
            to: e.substring(2, 4),
            promotion: e.substring(4)
        }
    } else {
        return {
            from: e.substring(0, 2),
            to: e.substring(2)
        }
    }
})

let agent = q()

let playingcolor = ''
let _moves = []

// if(fs.existsSync('model.json')) agent.fromJSON(JSON.parse(fs.readFileSync('model.json', 'utf-8')))

const achieve = (random) => {
    if(!fs.existsSync('stats.json')) fs.writeFileSync('stats.json', JSON.stringify({
        random: 0,
        predicted: 0
    }))

    let d = JSON.parse(fs.readFileSync('stats.json', 'utf-8'))
    d[random ? 'random' : 'predicted']++
    if (process.argv.includes('flag.stats')) fs.writeFileSync('./stats.json', JSON.stringify(d, null, 4))
}

async function choice() {
    let moves = game.moves({ verbose: true })
    let agentmove = ''
    // let m = moves[Math.floor(Math.random() * moves.length)]
    let m = (function feedback(depth = 5) {
        if (depth === 0) {
            achieve(true)
            return moves[Math.floor(Math.random() * moves.length)]
        }

        try {
            const start = +new Date
            let mm = agent.run(_moves)
            const end = +new Date

            if (mm.length !== 4) {
                if (mm.split(' ').filter(e => e.length === 4).length === 0) return feedback(depth - 1)
                else mm = mm.split(' ').filter(e => e.length === 4)[0]
            }
            agentmove = mm
            let m2 = parseVerbose(mm)

            if (moves.filter(e => e.from === m2.from && e.to === m2.to)[0]) {
                achieve(false)
                return m2
            }
            else {
                if(end - start > 500) return feedback(0)
                else return feedback(depth - 1)
            }
        } catch (e) {
            console.log(e)
            return feedback(depth - 1)
        }
    })()

    let m2 = m.from + m.to

    game.move(m)
    _moves.push(m2)

    // fs.writeFileSync('board.txt', mve(game.ascii()))
    // log('[INFO] Move: ' + m2 + ' - Agent: ' + agentmove)
    out('bestmove ' + m2)
}

const uci = {
    'uci': () => {
        // im gonna load the engine here!!!
        if (fs.existsSync('q.json')) agent.load('q.json')
        out(`id author Martia\\nid name Raven\\nuciok`, false)
    },
    'isready': () => {
        out('readyok')
    },
    'ucinewgame': () => {
        log('New game')
    },
    'position': (t) => {
        if (t[1] === 'moves') {
            if (playingcolor === '') playingcolor = 'white'
            _moves = t.slice(2)

            game = new Chess()
            t.slice(2).forEach((e) => {
                game.move(parseVerbose(e))
            })
            // console.log(game.moves({ verbose: true }).filter(e => e.promotion))
            wBoard()
        } else {
            if (playingcolor === '') {
                playingcolor = 'white'
            }

            game = new Chess()
            wBoard()
        }
    },
    'go': choice,
    'setoption': (t) => {
        if(t.includes('flag.ucidebug')) process.argv = ['flag.log', 'flag.stats', 'flag.board']
    },
    'stop': async () => {
        if (game.isGameOver() && !game.isDraw()) {
            let result = game.isCheckmate() ? 1 : 0

            /*TRAIN.MJS*/

            // the amount of moves the ai should consider beforehand.
            const ORDER = 2
            const ID = Math.floor(Math.random() * 20000).toString()

            const train = async (order, _moves) => {

                let agent2 = q()
                let data = _moves
                let _game = new Chess()
                let states = []

                if (fs.existsSync('q.json')) agent2.load('q.json')
                else agent2.save('q.json')

                let o = order === 1 ? true : false
                for (let move in data) {
                    if (o) {
                        states.push({
                            i: data.slice(move - ORDER < 0 ? 0 : move - ORDER, move).join(' '),
                            o: data[move]
                        })
                    }

                    o = !o
                }

                let i = 0
                const BEFORE_SIZE = Math.floor(JSON.stringify(agent2.data).length / 1000)

                log('[INFO] Running training... ' + ID)

                agent2.train(states)

                const AFTER_SIZE = Math.floor(JSON.stringify(agent2.data).length / 1000)
                // (\n\[INFO\] Iterations: .+)*
                if (process.argv.includes('flag.log')) {
                    fs.writeFileSync('info.txt', fs.readFileSync('info.txt', 'utf-8').replaceAll(/(\[INFO\] Running training\.\.\. .+)/g, (f) => {
                        if (f.includes(ID)) return '[INFO] Training finished! - Model size: ' + AFTER_SIZE + 'kb'
                        else return f
                    }))
                }

                agent2.save('q.json')
            }

            /*TRAIN.MJS*/

            await train(result, _moves)
        }
    },
    'quit': () => {
        process.exit(0)
    }
}

const out = (t, l = true) => {
    console.log(t)
    if (l) log('[OUT] ' + t)
}

function main() {
    if (!fs.existsSync('out.txt') && process.argv.includes('flag.log')) fs.writeFileSync('out.txt', '[BEGINNING OF LOGS]')
    if (!fs.existsSync('info.txt') && process.argv.includes('flag.log')) fs.writeFileSync('info.txt', '[BEGINNING OF INFO LOGS]')

    rl.question('', (t) => {
        log('[IN] ' + t)
        if (uci[t.split(' ')[0]]) {
            uci[t.split(' ')[0]](t.split(' ').slice(1))
        } else {
            log('[ERROR] Unknown command')
        }
        main()
    })
}

main()