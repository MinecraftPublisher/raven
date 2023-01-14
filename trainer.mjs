#!/usr/bin/env node

import { exec } from 'child_process'
import * as fs from 'fs'

try { fs.mkdirSync('temp2') } catch {}

const fillter = ((f) => f.filter(e => f.filter(j => e === j).length === 1))

const data = fillter(JSON.parse(fs.readFileSync('trained.json', 'utf-8')))
fs.writeFileSync('trained.json', JSON.stringify(data))
let i = 0

const INT = (200) / 1000
const PRECISION = (1) / 1000

const jj = setInterval(() => {
    if(i === data.length) clearInterval(jj)

    const e = data[i++]
    const ID = Math.floor(Math.random() * 20000).toString()
    fs.writeFileSync('temp2/' + ID, `position startpos moves ${e}\nstop\n`)
    exec('./raven < temp2/' + ID)

    let nise = (Math.round((data.length - i) * (INT * (1 / PRECISION))) < 0 ? 0 : Math.round((data.length - i) * (INT * (1 / PRECISION))) * PRECISION).toString()
    if(nise.length === 1) nise = nise + '.0'
    if(nise.length > 3) nise = nise.substring(0, 3)
    console.clear()
    console.log(`Count: ${data.length} - Will take: ${data.length * INT}s - Remaining: ${nise}s`)
}, INT * 1000)

void(0);