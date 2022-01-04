module.exports = function fixDepth(x) {
  for (var d = 0, z = x; Array.isArray(z); z = z[0]) d++
  if (d === 2) {
    return [[x]]
  } else if (d === 3) {
    return [x]
  }
  return x
}
