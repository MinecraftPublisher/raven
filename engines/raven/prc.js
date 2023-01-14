export const mve = function(txt) {
    txt = txt.replaceAll('R', '♜')
    txt = txt.replaceAll('N', '♞')
    txt = txt.replaceAll('B', '♝')
    txt = txt.replaceAll('Q', '♛')
    txt = txt.replaceAll('K', '♚')
    txt = txt.replaceAll('P', '♟')

    txt = txt.replaceAll('r', '♖')
    txt = txt.replaceAll('n', '♘')
    txt = txt.replaceAll('b', '♗')
    txt = txt.replaceAll('q', '♕')
    txt = txt.replaceAll('k', '♔')
    txt = txt.replaceAll('p', '♙')

    return txt
}

export const chunk = function(str, len) {
    const size = Math.ceil(str.length/len)
    const r = Array(size)
    let offset = 0
    
    for (let i = 0; i < size; i++) {
      r[i] = str.substr(offset, len)
      offset += len
    }
    
    return r
  }