/* script for compiling raven into a single file. */
const fs = require('fs')
const UglifyJs = require('uglify-js')
const rf = ((p) => fs.readFileSync(p, 'utf-8'))

const START = +new Date

console.log('Reading main file...')

// load in the main file to make the changes!
let main = rf('engines/raven/main.js')

console.log('Compiling chess.js...')

// get the chess.js library
// text to replace = `import { Chess } from 'chess.js'`
let chess_js = (() => {
    let f1 = rf('/Users/martia/node_modules/chess.js/dist/chess.js')
    return `const Chess = (() => { let exports = {}; ${f1}; return exports.Chess })();`
})()

console.log('Compiling fastest-levenshtein...')

// this is a dependency for q.
// text to replace = `import { closest } from 'fastest-levenshtein'`
let fastest_levenshtein = (() => {
    let f1 = rf('engines/raven/node_modules/fastest-levenshtein/mod.js')

    return `const closest = (() => { let exports = {}; ${f1}; return exports.closest })()`
})()

console.log('Compiling q...')

// get q
// text to replace = `import { q } from './q.mjs'`
let q = (() => {
    let f1 = rf('engines/raven/q.mjs')
    let f2 = fastest_levenshtein

    f1 = f1.replaceAll(`import { closest } from 'fastest-levenshtein'`, f2)
    f1 = f1.replaceAll(`import * as fs from 'fs'\n`, '')
    f1 = f1.replaceAll(/\nconst log = .+\n/g, '')
    f1 = f1.replaceAll(`THIS.load = ((file) => THIS.data = JSON.parse(fs.readFileSync(file, 'utf-8')))`, `THIS.load = ((file) => THIS.data = JSON.parse(/*fs.readFileSync(file, 'utf-8')*/Q_DATA))`)
    f1 = f1.replaceAll(`THIS.save = ((file) => fs.writeFileSync(file, JSON.stringify(THIS.data)))`, `THIS.save = ((file) => fs.writeFileSync(__filename, fs.readFileSync(__filename, 'utf-8')).replaceAll(/const Q_DATA = \`.+\`;/g, \`const Q_DATA = \\\`\${JSON.stringify(THIS.data)}\\\`\`))`)

    return `const q = (() => { ${f1.replaceAll('export const ', 'const ')}; return q; })()`
})()

// get the move parser
// HAHA JUST KIDDING!!!

// the log function works only with a flag enabled OwO

console.log('Putting everything together...')

main = main.replaceAll(`import { Chess } from 'chess.js'`, chess_js)
main = main.replaceAll(`import { q } from './q.mjs'`, q)
main = main.replaceAll(`import * as readline from 'readline'
import * as fs from 'fs'`, `const readline = require('readline')
const fs = require('fs')`)

try { main = main.replaceAll(`const Q_DATA = \`\``, `const Q_DATA = \`${fs.readFileSync('q.json', 'utf-8')}\``) } catch { }

console.log('Minifying...')

main = UglifyJs.minify(main).code.replaceAll(`\\\\n`, '\\n')

const END = +new Date

console.log('Done! Took: ' + (END - START) + 'ms')
console.log('Minified size: ' + Math.round(main.length / 1000) + 'kb')

fs.writeFileSync('raven.js', main)