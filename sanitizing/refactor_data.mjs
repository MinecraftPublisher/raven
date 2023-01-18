import * as fs from 'fs'

let data = JSON.parse(fs.readFileSync('q.json', 'utf-8'))
const before_size = JSON.stringify(data).length
let data2 = data.map(e => {
    return JSON.parse(JSON.stringify(e).replaceAll('input', 'i').replaceAll('output', 'o'))
})
const after_size = JSON.stringify(data2).length

fs.writeFileSync('q.json', JSON.stringify(data2))
console.log('Done. Size difference: ' + (before_size - after_size) / 1000 + 'kb')