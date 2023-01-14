#!/usr/bin/env node

import { Chess } from 'chess.js'
import { q } from './q.mjs'
import * as fs from 'fs'

const alph = [
    '', '', '', '', '', '', '', '', '', '',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h',
    '1', '2', '3', '4', '5', '6', '7', '8'
]

const encode = (text) => text.split('').map(e => alph.indexOf(e).toString()).join('')
const decode = (text) => chunk(text, 2).map(e => alph[e]).join('')

const log = (t) => t.startsWith('[INFO] ') ? fs.writeFileSync('info.txt', fs.readFileSync('info.txt', 'utf-8') + '\n' + t) : fs.writeFileSync('out.txt', fs.readFileSync('out.txt', 'utf-8') + '\n' + t)

const out = (t, l = true) => {
    console.log(t)
    if (l) log('[OUT] ' + t)
}

// the amount of moves the ai should consider beforehand.
const ORDER = 2
const ID = Math.floor(Math.random() * 20000).toString()

const train = async (order, _moves) => {
    if (JSON.parse(fs.readFileSync('trained.json')).includes(_moves.join(' '))) {
        return process.exit(1)
    }
    fs.writeFileSync('trained.json', JSON.stringify([...JSON.parse(fs.readFileSync('trained.json')), _moves.join(' ')], null, 4))

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
    process.exit(1)
}

const x = process.argv[4] || process.argv[3] || process.argv[2] || null

if (x) {
    const data = JSON.parse(fs.readFileSync('temp/' + x + '.json'))
    fs.rmSync('temp/' + x + '.json')
    train(...data)
}