#!/usr/bin/env node

/**
 * AVAILABLE FLAGS:
 * flag.log -> Logs output to `out.txt` and `info.txt`
 * flag.stats -> Write statistics (predicted and random) to `stats.json`
 * floag.board -> Write the chess board to `board.txt`
 */

const Q_DATA = ``
const BYPASS = true

import { Chess } from 'chess.js'
import { q } from './q.mjs'
//import { mve } from './prc.js'
import * as readline from 'readline'
import * as fs from 'fs'

let minimaxDepth = 2

const ai = (() => {
    let game = new Chess()

    const reverseArray = (array) => array.slice().reverse()

    let whitePawnEval =
        [
            [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
            [5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
            [1.0, 1.0, 2.0, 3.0, 3.0, 2.0, 1.0, 1.0],
            [0.5, 0.5, 1.0, 2.5, 2.5, 1.0, 0.5, 0.5],
            [0.0, 0.0, 0.0, 2.0, 2.0, 0.0, 0.0, 0.0],
            [0.5, -0.5, -1.0, 0.0, 0.0, -1.0, -0.5, 0.5],
            [0.5, 1.0, 1.0, -2.0, -2.0, 1.0, 1.0, 0.5],
            [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
        ]

    let blackPawnEval = reverseArray(whitePawnEval)

    let knightEval =
        [
            [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
            [-4.0, -2.0, 0.0, 0.0, 0.0, 0.0, -2.0, -4.0],
            [-3.0, 0.0, 1.0, 1.5, 1.5, 1.0, 0.0, -3.0],
            [-3.0, 0.5, 1.5, 2.0, 2.0, 1.5, 0.5, -3.0],
            [-3.0, 0.0, 1.5, 2.0, 2.0, 1.5, 0.0, -3.0],
            [-3.0, 0.5, 1.0, 1.5, 1.5, 1.0, 0.5, -3.0],
            [-4.0, -2.0, 0.0, 0.5, 0.5, 0.0, -2.0, -4.0],
            [-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
        ]

    let whiteBishopEval = [
        [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
        [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
        [-1.0, 0.0, 0.5, 1.0, 1.0, 0.5, 0.0, -1.0],
        [-1.0, 0.5, 0.5, 1.0, 1.0, 0.5, 0.5, -1.0],
        [-1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, -1.0],
        [-1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0],
        [-1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, -1.0],
        [-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
    ]

    let blackBishopEval = reverseArray(whiteBishopEval)

    let whiteRookEval = [
        [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        [0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5],
        [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
        [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
        [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
        [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
        [-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
        [0.0, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0]
    ]

    let blackRookEval = reverseArray(whiteRookEval)

    let evalQueen = [
        [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
        [-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
        [-1.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
        [-0.5, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
        [0.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
        [-1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
        [-1.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, -1.0],
        [-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
    ]

    let whiteKingEval = [

        [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
        [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
        [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
        [-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
        [-2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
        [-1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
        [2.0, 2.0, 0.0, 0.0, 0.0, 0.0, 2.0, 2.0],
        [2.0, 3.0, 1.0, 0.0, 0.0, 1.0, 3.0, 2.0]
    ]

    let blackKingEval = reverseArray(whiteKingEval)

    const calculateBestMove = () => {
        var possibleNextMoves = game.moves()
        var bestMove = -9999
        var bestMoveFound

        for (let i = 0; i < possibleNextMoves.length; i++) {
            let possibleNextMove = possibleNextMoves[i]
            game.move(possibleNextMove)
            let value = minimax(minimaxDepth, -10000, 10000, false)
            game.undo()

            if (value >= bestMove) {
                bestMove = value
                bestMoveFound = possibleNextMove
            }
        }

        return game.moves({ verbose: true })[possibleNextMoves.indexOf(bestMoveFound)]
    }

    const minimax = (depth, alpha, beta, isMaximisingPlayer) => {
        if (depth === 0) return -evaluateBoard(game.board())
        let bestMove

        let possibleNextMoves = game.moves()
        let numPossibleMoves = possibleNextMoves.length

        if (isMaximisingPlayer) {
            bestMove = -9999

            for (let i = 0; i < numPossibleMoves; i++) {
                game.move(possibleNextMoves[i])
                bestMove = Math.max(bestMove, minimax(depth - 1, alpha, beta, !isMaximisingPlayer))
                game.undo()

                alpha = Math.max(alpha, bestMove)

                if (beta <= alpha) return bestMove
            }

        } else {
            bestMove = 9999

            for (let i = 0; i < numPossibleMoves; i++) {
                game.move(possibleNextMoves[i])
                bestMove = Math.min(bestMove, minimax(depth - 1, alpha, beta, !isMaximisingPlayer))
                game.undo()
                beta = Math.min(beta, bestMove)

                if (beta <= alpha) return bestMove
            }
        }

        return bestMove
    }

    const evaluateBoard = function (board) {
        let totalEvaluation = 0

        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                totalEvaluation = totalEvaluation + getPieceValue(board[i][j], i, j)
            }
        }

        return totalEvaluation
    }

    const getPieceValue = (piece, x, y) => {
        if (piece === null) return 0

        let absoluteValue = getAbsoluteValue(piece, piece.color === 'w', x, y)

        if (piece.color === 'w') return absoluteValue
        else return -absoluteValue
    }

    const getAbsoluteValue = function (piece, isWhite, x, y) {
        if (piece.type === 'p') return 10 + (isWhite ? whitePawnEval[y][x] : blackPawnEval[y][x])
        else if (piece.type === 'r') return 50 + (isWhite ? whiteRookEval[y][x] : blackRookEval[y][x])
        else if (piece.type === 'n') return 30 + knightEval[y][x]
        else if (piece.type === 'b') return 30 + (isWhite ? whiteBishopEval[y][x] : blackBishopEval[y][x])
        else if (piece.type === 'q') return 90 + evalQueen[y][x]
        else if (piece.type === 'k') return 900 + (isWhite ? whiteKingEval[y][x] : blackKingEval[y][x])
    }

    return {
        calculateBestMove,
        game
    }
})()

// placeholder for real prc cus i was too lazy to implement it :)
const mve = ((t) => t)

console.log('Raven uci engine')

const log = (t) => {
    if (process.argv.includes('flag.log') || BYPASS) t.startsWith('[INFO] ') ? fs.writeFileSync('info.txt', fs.readFileSync('info.txt', 'utf-8') + '\n' + t) : fs.writeFileSync('out.txt', fs.readFileSync('out.txt', 'utf-8') + '\n' + t)
}

const wBoard = (() => {
    if (process.argv.includes('flag.board') || BYPASS) fs.writeFileSync('board.txt', mve(game.ascii()))
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

const achieve = (minimax) => {
    if(!fs.existsSync('stats.json')) fs.writeFileSync('stats.json', JSON.stringify({
        minimax: 0,
        predicted: 0
    }))

    let d = JSON.parse(fs.readFileSync('stats.json', 'utf-8'))
    d[minimax ? 'minimax' : 'predicted']++
    if (process.argv.includes('flag.stats') || BYPASS) fs.writeFileSync('./stats.json', JSON.stringify(d, null, 4))
    if (process.argv.includes('flag.log') || BYPASS) {
        if(minimax) log('[INFO] Minimax move')
        else log('[INFO] Predicted move')
    }
}

async function choice() {
    let moves = game.moves({ verbose: true })
    let agentmove = ''
    let m = (function feedback(depth = 10) {
        if (depth <= 0) {
            // changed this to minimax!!!!
            achieve(true)

            const STARTT = +new Date

            ai.game = new Chess()
            game.history().forEach(e => ai.game.move(e))

            let output = ai.calculateBestMove()
            log('[INFO] Minimax with depth ' + minimaxDepth + ' took: ' + (+new Date - STARTT) + 'ms')
            return output
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
            } else {
                if(end - start > 700) return feedback(0)
                else return feedback(depth - 1)
            }
        } catch (e) {
            console.log(e)
            return feedback(depth - 1)
        }
    })()

    let m2 = m.from + m.to + (m.promotion || '')

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
        /* if(t.includes('flag.ucidebug')) {
            process.argv = ['flag.log', 'flag.stats', 'flag.board']
            out('info Enabled debug mode.')
        } */
    },
    'stop': async () => {
        if (game.isGameOver() && !game.isDraw()) {
            let result = game.isCheckmate() ? 1 : 0

            /*TRAIN.MJS*/

            // the amount of moves the ai should consider beforehand.
            const ORDER = 2
            const ID = Math.floor(Math.random() * 20000).toString()

            const train = async (order, _moves) => {
                fs.writeFileSync('/dev/last-train', +new Date)

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
                if (process.argv.includes('flag.log') || BYPASS) {
                    fs.writeFileSync('info.txt', fs.readFileSync('info.txt', 'utf-8').replaceAll(/(\[INFO\] Running training\.\.\. .+)/g, (f) => {
                        if (f.includes(ID)) return '[INFO] Training finished! - Model size: ' + AFTER_SIZE + 'kb'
                        else return f
                    }))
                }

                agent2.save('q.json')
            }

            /*TRAIN.MJS*/

            if(fs.existsSync('/dev/last-train')) {
                if(+new Date - parseInt(fs.readFileSync('/dev/last-train', 'utf-8')) < 10000) null
            }
            else await train(result, _moves)
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
    if (!fs.existsSync('out.txt') && (process.argv.includes('flag.log') || BYPASS)) fs.writeFileSync('out.txt', '[BEGINNING OF LOGS]')
    if (!fs.existsSync('info.txt') && (process.argv.includes('flag.log') || BYPASS)) fs.writeFileSync('info.txt', '[BEGINNING OF INFO LOGS]')

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