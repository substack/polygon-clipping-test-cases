exports.pclipXY = (function () {
  var pclip = require('pclip')
  var xy = require('pclip/xy')
  return fnorm({
    union: (A,B) => pclip.union(A,B,xy),
    difference: (A,B) => pclip.difference(A,B,xy),
    intersect: (A,B) => pclip.intersect(A,B,xy),
    exclude: (A,B) => pclip.exclude(A,B,xy),
    version: '1.4.0',
  })
})()

exports.martinez = fnorm(Object.assign(
  { version: '0.7.1' },
  require('martinez-polygon-clipping'),
))

exports.polygonClipping = (function () {
  var pc = require('polygon-clipping')
  return fnorm({
    union: (A,B) => pc.union(fixDepth(A),fixDepth(B)),
    difference: (A,B) => pc.difference(fixDepth(A),fixDepth(B)),
    intersect: (A,B) => pc.intersection(fixDepth(A),fixDepth(B)),
    exclude: (A,B) => pc.xor(fixDepth(A),fixDepth(B)),
    version: '0.15.3',
  })
})()

function fnorm(m) {
  return Object.assign({
    union: m.union,
    intersect: m.intersect || m.intersection,
    difference: m.difference || m.diff,
    exclude: m.exclude || m.xor,
  }, m)
}

function fixDepth(x) {
  for (var d = 0, z = x; Array.isArray(z); z = z[0]) d++
  if (d === 2) {
    return [[x]]
  } else if (d === 3) {
    return [x]
  }
  return x
}

function fixGeojson(x) {
  for (var d = 0, z = x; Array.isArray(z); z = z[0]) d++
  var e = 1e-8
  if (d === 2) {
    if (distance(x[0],x[x.length-1]) > e) x.push(x[0])
  } else if (d === 3) {
    for (var i = 0; i < x.length; i++) {
      if (distance(x[i][0],x[i][x[i].length-1]) > e) x[i].push(x[i][0])
    }
  } else if (d === 4) {
    for (var i = 0; i < x.length; i++) {
      for (var j = 0; j < x[i].length; j++) {
        if (distance(x[i][j][0],x[i][j][x[i][j].length-1]) > e) x[i][j].push(x[i][j][0])
      }
    }
  }
  return x
}
