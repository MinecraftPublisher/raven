#!/usr/bin/env node

import { Chess } from 'chess.js'
import { q } from './q.mjs'
import * as readline from 'readline'
import * as fs from 'fs'
import { mve, chunk } from './prc.js'
import { exec } from 'child_process'

const log = (t) => t.startsWith('[INFO] ') ? fs.writeFileSync('info.txt', fs.readFileSync('info.txt', 'utf-8') + '\n' + t) : fs.writeFileSync('out.txt', fs.readFileSync('out.txt', 'utf-8') + '\n' + t)

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
if(fs.existsSync('q.json')) agent.load('q.json')

const achieve = (random) => {
    let d = JSON.parse(fs.readFileSync('stats.json', 'utf-8'))
    d[random ? 'random' : 'predicted']++
    fs.writeFileSync('stats.json', JSON.stringify(d, null, 4))
}

async function choice() {
    let moves = game.moves({ verbose: true })
    let agentmove = ''
    // let m = moves[Math.floor(Math.random() * moves.length)]
    let m = (function feedback(depth = 20) {
        if(depth === 0) {
            achieve(true)
            return moves[Math.floor(Math.random() * moves.length)]
        }

        try {
            let mm = agent.run(_moves.join(' '))
            if(mm.length !== 4) {
                if(mm.split(' ').filter(e => e.length === 4).length === 0) return feedback(depth - 1)
                else mm = mm.split(' ').filter(e => e.length === 4)[0]
            }
            agentmove = mm
            let m2 = parseVerbose(mm)
    
            if(moves.filter(e => e.from === m2.from && e.to === m2.to)[0]) {
                achieve(false)
                return m2
            }
            else return feedback(depth - 1)
        } catch (e) {
            console.log(e)
            return feedback(depth - 1)
        }
    })()

    let m2 = m.from + m.to

    game.move(m)
    _moves.push(m2)

    fs.writeFileSync('board.txt', mve(game.ascii()))
    // log('[INFO] Move: ' + m2 + ' - Agent: ' + agentmove)
    out('bestmove ' + m2)
}

const uci = {
    'uci': () => {
        out(`id author Martia\nid name Raven\nuciok`, false)
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
            fs.writeFileSync('board.txt', mve(game.ascii()))
        } else {
            if (playingcolor === '') {
                playingcolor = 'white'
            }

            game = new Chess()
            fs.writeFileSync('board.txt', mve(game.ascii()))
        }
    },
    'go': choice,
    'setoption': () => { },
    'stop': async () => {
        if (game.isGameOver() && !game.isDraw()) {
            let result = game.isCheckmate() ? 1 : 0

            /*TRAIN.MJS*/

            // the amount of moves the ai should consider beforehand.
            const ORDER = 2
            const ID = Math.floor(Math.random() * 20000).toString()

            const train = async (order, _moves) => {
                /* if (JSON.parse(fs.readFileSync('trained.json')).includes(_moves.join(' '))) {
                    return process.exit(0)
                }
                fs.writeFileSync('trained.json', JSON.stringify([...JSON.parse(fs.readFileSync('trained.json')), _moves.join(' ')], null, 4)) */
            
                let agent2 = q()
                let data = _moves
                let _game = new Chess()
                let states = []
            
                if(fs.existsSync('q.json')) agent2.load('q.json')
                else agent2.save('q.json')
            
                let o = order === 1 ? true : false
                for (let move in data) {
                    if (o) {
                        states.push({
                            input: data.slice(move - ORDER < 0 ? 0 : move - ORDER, move).join(' '),
                            output: data[move]
                        })
                    }
            
                    o = !o
                }
                
                let i = 0
                const BEFORE_SIZE = Math.floor(JSON.stringify(agent2.data).length / 1000)
            
                log('[INFO] Running training... ' + ID)
            
                agent2.train(states/*, {
                    iterations: ITERATIONS,
                    callbackPeriod,
                    log: false,
                    callback: () => log('[INFO] Iterations: ' + (i++ * callbackPeriod))
                }*/)
            
                // const JJ = agent.toJSON()
                // const BEFORE_VALUES = JJ['options']['dataFormatter']['values'].length
                // JJ['options']['dataFormatter']['values'] = Array.from(new Set([...JJ['options']['dataFormatter']['values'].filter(e => e.input.split(' ').length === ORDER), ...states]))
                // const STR = JSON.stringify(JJ)
                // const AFTER_VALUES = JJ['options']['dataFormatter']['values'].length
            
                const AFTER_SIZE = Math.floor(JSON.stringify(agent2.data).length / 1000)
                // (\n\[INFO\] Iterations: .+)*
                fs.writeFileSync('info.txt', fs.readFileSync('info.txt', 'utf-8').replaceAll(/(\[INFO\] Running training\.\.\. .+)/g, (f) => {
                    if(f.includes(ID)) return '[INFO] Training finished! - Model size: ' + AFTER_SIZE + 'kb'
                    else return f
                }))
                // fs.writeFileSync('info.txt', fs.readFileSync('info.txt', 'utf-8').replaceAll(/(\n\[INFO\] Iterations: .+)+/g, ''))
                // fs.writeFileSync('model.json', STR)
                agent2.save('q.json')
            }

            /*TRAIN.MJS*/

            await train(result, _moves)
            // fs.writeFileSync('temp/' + id + '.json', data)
            // exec('nohup ~/projects/raven/train.mjs ' + id + ' &')
            // exec('~/projects/raven/train.mjs ' + id)
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
    if (!fs.existsSync('out.txt')) fs.writeFileSync('out.txt', '[BEGINNING OF LOGS]')
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