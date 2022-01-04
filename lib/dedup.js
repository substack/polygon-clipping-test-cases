var distance = require('gl-vec2/distance')

module.exports = function (X, epsilon) {
  for (var d = 0, z = X; Array.isArray(z); z = z[0]) d++
  if (d === 2) {
    var l = X.length
    var ring = []
    for (var i = 0; i < l; i++) {
      var a = X[i]
      var b = X[(i+l-1)%l]
      if (distance(a,b) > epsilon) {
        ring.push(a)
      }
    }
    return ring
  } else if (d === 3) {
    var rings = []
    for (var i = 0; i < X.length; i++) {
      var ring = []
      var l = X[i].length
      for (var j = 0; j < l; j++) {
        var a = X[i][j]
        var b = X[i][(j+l-1)%l]
        if (distance(a,b) > epsilon) {
          ring.push(a)
        }
      }
      rings.push(ring)
    }
    return rings
  } else if (d === 4) {
    var R = []
    for (var i = 0; i < X.length; i++) {
      var rings = []
      for (var j = 0; j < X[i].length; j++) {
        var ring = []
        var l = X[i][j].length
        for (var k = 0; k < l; k++) {
          var a = X[i][j][k]
          var b = X[i][j][(k+l-1)%l]
          if (distance(a,b) > epsilon) {
            ring.push(a)
          }
        }
        rings.push(ring)
      }
      R.push(rings)
    }
    return R
  }
  return X
}
