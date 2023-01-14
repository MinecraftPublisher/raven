const fs = require('fs')

let i = 0
const dr = ((path = './') => {
    console.log('( )> ' + path)
    fs.readdirSync(path).filter(e => !e.startsWith('.')).map(e => (path + '/' + e).replaceAll(/\/+/g, '/')).forEach(e => {
        try {
            console.log('(+)> ' + e)
            if (fs.statSync(e).isDirectory()) dr(e)
            else if (e === '.DS_STORE') {
                i++
                console.log('(-)> ' + e + '')
                fs.rmSync(e)
            }
        } catch {
            console.log('(x)> ' + e + '')
        }
    })
})

dr()
console.log('Total: ' + i)