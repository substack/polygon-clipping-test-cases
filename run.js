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
  console.log([
    'total',
    lib.name.padStart(8),
    `${String(s.ok).padStart(4)} ok`,
    `${String(s.fail).padStart(4)} fail`,
    `${String(s.err).padStart(4)} err`,
    `${pr}%`
  ].join('  '))
})

function run(stats, data, file) {
  var epsilon = 1e-4
  var ds = { union: [], intersect: [], difference: [], exclude: [] }
  Object.keys(data).forEach(key => {
    if (/^union/.test(key)) ds.union.push(data[key])
    if (/^intersect/.test(key)) ds.intersect.push(data[key])
    if (/^difference/.test(key)) ds.difference.push(data[key])
    if (/^exclude/.test(key)) ds.exclude.push(data[key])
  })
  libs.forEach(lib => {
    var result = { union: 'FAIL', intersect: 'FAIL', difference: 'FAIL', exclude: 'FAIL' }
    Object.keys(result).forEach(key => {
      var r = 'FAIL'
      try {
        var d = lib.m[key](data.A, data.B) || []
      } catch (e) {
        r = 'ERR '
      }
      if (d && r !== 'ERR ') {
        for (var i = 0; i < ds[key].length; i++) {
          if (polygonEq(d, ds[key][i], epsilon)) {
            r = 'OK  '
            break
          }
        }
      }
      result[key] = r
    })
    var npass = 0, ntotal = 0
    var u = result.union, i = result.intersect, d = result.difference, x = result.exclude
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
