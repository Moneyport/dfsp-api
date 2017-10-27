let alphaNumericSymbols = 'abcdefghijklmnopqrstuvwxyz1234567890'

let commonPatterns = [
  'abcdefghijklmnopqrstuvwxyz', // english alphabet
  'qwertyuiop', // first keyboard line
  'asdfghjkl', // second keyboard line
  'zxcvbnm', // third keyboard line
  'adgjmptw', // all first letters from ussd keyboard menu
  '01234567890' // numbers
]

// takes a portion from common patterns and search it in a provided pass
// example common pattern '01234567890' and REPEATABLE_SEQUENCE = 3 then if pass contains
// any sequence of 3 pattern symbols (012, 123, 234, ..., 890) marks this pass as weak.
// This constant also works for repeared symbols for example if pass contains 3 equal symbols (aaa, bbb, ccc)
// then it is also considered as weak
const REPEATABLE_SEQUENCE = 5

// password must be at least MIN_PASS_LENGTH symbols
const MIN_PASS_LENGTH = 4

var containsString = function (source, pattern) {
  if (source.indexOf(pattern) > -1) {
    return true
  }
  return false
}

var reverseString = function (str) {
  var newString = ''
  for (var i = str.length - 1; i >= 0; i--) {
    newString += str[i]
  }
  return newString
}

var patternsSearch = function (pass, patterns, sequenceLength) {
  for (let i = 0, patternsLength = patterns.length; i < patternsLength; i++) {
    for (let j = 0, patLen = patterns[i].length; j < patLen; j++) {
      if (j + sequenceLength <= patLen) {
        if (containsString(pass, patterns[i].substring(j, j + sequenceLength))) {
          return true
        }
        if (containsString(pass, patterns[i].toUpperCase().substring(j, j + sequenceLength))) {
          return true
        }
      }
    }
  }
  return false
}

var isWeakPass = function (pass, weakPassOptions) {
  let options = weakPassOptions || {}
  options.commonPatterns = options.commonPatterns || commonPatterns
  options.alphaNumericSymbols = options.alphaNumericSymbols || alphaNumericSymbols
  options.sequenceLength = options.sequenceLength || REPEATABLE_SEQUENCE
  options.minLength = options.minLength || MIN_PASS_LENGTH

  if (pass.length < options.minLength) {
    return true
  }

  let repeatablePatterns = []
  let reversedPatterns = []
  for (let i = 0, alphaNumericSymbolsLength = options.alphaNumericSymbols.length; i < alphaNumericSymbolsLength; i++) {
    repeatablePatterns.push(options.alphaNumericSymbols[i].repeat(options.sequenceLength))
  }
  for (let i = 0, commonPatternsLength = options.commonPatterns.length; i < commonPatternsLength; i++) {
    reversedPatterns.push(reverseString(options.commonPatterns[i]))
  }
  let patterns = options.commonPatterns.concat(repeatablePatterns)
  patterns = patterns.concat(reversedPatterns)
  if (patternsSearch(pass, patterns, options.sequenceLength)) {
    return true
  }
  return false
}

module.exports = {
  isWeakPass: isWeakPass
}
