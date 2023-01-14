const fs = require('fs')

const dr = ((path = './') => {
    fs.readdirSync(path).forEach(e => {
        if(fs.statSync(e).isDirectory()) dr(path + '/' + e)
        else if(e === '.DS_STORE') fs.rmSync(path + '/' + e)
    })
})