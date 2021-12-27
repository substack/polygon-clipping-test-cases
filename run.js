var fs = require('fs')
var path = require('path')
var polygonEq = require('polygon-eq')
var { distance } = require('pclip/xy')

var algorithms = require('./lib/algorithms.js')
var libs = [
  { name: 'pclip/xy', m: algorithms.pclipXY },
  { name: 'martinez', m: algorithms.martinez },
  { name: 'polygonc', m: algorithms.polygonClipping },
]

var files = fs.readdirSync(path.join(__dirname, 'data'))
var stats = {}
libs.forEach(lib => {
  stats[lib.name] = { ok: 0, fail: 0, err: 0 }
})
files.forEach(file => {
  if (/^\./.test(file) || !/\.json$/.test(file)) return
  var src = fs.readFileSync(path.join(__dirname, 'data', file), 'utf8')
  var data = JSON.parse(src)
  run(stats, data, file)
})
libs.forEach(lib => {
  var s = stats[lib.name]
  var pr = (s.ok / (s.ok+s.fail+s.err) * 100).toFixed(1).padStart(5)
  console.log(`total  ${lib.name.padStart(8)}  ${s.ok} ok  ${s.fail} fail  ${s.err} err  ${pr}%`)
})

function run(stats, data, file) {
  libs.forEach(lib => {
    try {
      var u = polygonEq(lib.m.union(data.A, data.B) || [], data.union) ? 'OK  ' : 'FAIL'
    } catch (e) { u = 'ERR ' }
    try {
      var i = polygonEq(lib.m.intersect(data.A, data.B) || [], data.intersect) ? 'OK  ' : 'FAIL'
    } catch (e) { i = 'ERR ' }
    try {
      var d = polygonEq(lib.m.difference(data.A, data.B) || [], data.difference) ? 'OK  ' : 'FAIL'
    } catch (e) { d = 'ERR ' }
    try {
      var x = polygonEq(lib.m.exclude(data.A, data.B) || [], data.exclude) ? 'OK  ' : 'FAIL'
    } catch (e) { x = 'ERR ' }
    var npass = 0, ntotal = 0
    ;[u,i,d,x].forEach(q => {
      var k = q.trim().toLowerCase()
      if (k === 'ok') npass++
      ntotal++
      stats[lib.name][k]++
    })
    var pc = (100*npass/ntotal).toFixed(0).padStart(3)
    console.log(`${file.padEnd(8)}  ${lib.name.padStart(8)}  u:${u}  i:${i}  d:${d}  x:${x}  ${pc}%`)
  })
  console.log()
}
