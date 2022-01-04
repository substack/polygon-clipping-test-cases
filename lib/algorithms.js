var fixDepth = require('./fix-depth.js')
var distance = require('gl-vec2/distance')

exports.pclipXY = (function () {
  var pclip = require('pclip')
  var xy = require('pclip/xy')
  return {
    union: (A,B) => pclip.union(A,B,xy),
    difference: (A,B) => pclip.difference(A,B,xy),
    intersect: (A,B) => pclip.intersect(A,B,xy),
    exclude: (A,B) => pclip.exclude(A,B,xy),
    pkg: 'pclip@1.4.4',
  }
})()

exports.martinez = (function () {
  var mz = require('martinez-polygon-clipping')
  return {
    union: (A,B) => mz.union(fix(A),fix(B)),
    difference: (A,B) => mz.diff(fix(A),fix(B)),
    intersect: (A,B) => mz.intersection(fix(A),fix(B)),
    exclude: (A,B) => mz.xor(fix(A),fix(B)),
    pkg: 'martinez-polygon-clipping@0.7.1',
  }
})()

exports.polygonClipping = (function () {
  var pc = require('polygon-clipping')
  return {
    union: (A,B) => pc.union(fixDepth(A),fixDepth(B)),
    difference: (A,B) => pc.difference(fixDepth(A),fixDepth(B)),
    intersect: (A,B) => pc.intersection(fixDepth(A),fixDepth(B)),
    exclude: (A,B) => pc.xor(fixDepth(A),fixDepth(B)),
    pkg: 'polygon-clipping@0.15.3',
  }
})()

function fixLoop(x) {
  for (var d = 0, z = x; Array.isArray(z); z = z[0]) d++
  var e = 1e-8
  if (d === 2) {
    x = x.slice()
    if (distance(x[0],x[x.length-1]) > e) {
      x.push(x[0])
    }
  } else if (d === 3) {
    x = x.slice()
    for (var i = 0; i < x.length; i++) {
      x[i] = x[i].slice()
      if (distance(x[i][0],x[i][x[i].length-1]) > e) {
        x[i].push(x[i][0])
      }
    }
  } else if (d === 4) {
    for (var i = 0; i < x.length; i++) {
      x[i] = x[i].slice()
      for (var j = 0; j < x[i].length; j++) {
        x[i][j] = x[i][j].slice()
        if (distance(x[i][j][0],x[i][j][x[i][j].length-1]) > e) {
          x[i][j].push(x[i][j][0])
        }
      }
    }
  }
  return x
}

function fix(x) {
  return fixLoop(fixDepth(x))
}
