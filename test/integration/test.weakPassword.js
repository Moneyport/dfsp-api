var test = require('blue-tape')
var passValidation = require('../../service/custom/wallet/password-validation')

const strongSecurity = {
  sequenceLength: 3,
  minLength: 4
}

const lowSecurity = {
  sequenceLength: 5,
  minLength: 4
}

const commonPatterns = [
  'qwertyuiop',
  'poiuytrewq',
  'asdfghjkl',
  'lkjhgfdsa',
  'zxcvbnm',
  'mnbvcxz',
  'adgjmptw',
  'wtpmjgda',
  '01234567890',
  '09876543210'
]

test('repeatable password test', (t) => {
  const strongSecuritySequenceLenght = 3
  const englishAlphabet = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const weakPassOptions = {
    sequenceLength: strongSecuritySequenceLenght,
    minLength: 3
  }

  t.plan(englishAlphabet.length + numbers.length)

  for (let i = 0, loopLength = englishAlphabet.length; i < loopLength; i++) {
    let passToTest = englishAlphabet[i].repeat(strongSecuritySequenceLenght)
    let alphabetTest = passValidation.isWeakPass(passToTest, weakPassOptions)
    t.equal(alphabetTest, true, `verifing password: ${passToTest}`)
  }

  for (let j = 0, loopLength = numbers.length; j < loopLength; j++) {
    let passToTest = numbers[j].repeat(strongSecuritySequenceLenght)
    let numbersTest = passValidation.isWeakPass(passToTest, weakPassOptions)
    t.equal(numbersTest, true, `verifing password: ${passToTest}`)
  }
})

test('common patterns test', (t) => {
  const strongSecuritySequenceLenght = 3
  const weakPassOptions = {
    sequenceLength: strongSecuritySequenceLenght,
    // in order to test actual passwords content not only length
    minLength: 2
  }
  let passesToTest = []
  for (let i = 0, commonPatternsLen = commonPatterns.length; i < commonPatternsLen; i++) {
    for (let j = 0; j < commonPatterns[i].length - strongSecuritySequenceLenght + 1; j++) {
      passesToTest.push(commonPatterns[i].substring(j, j + strongSecuritySequenceLenght))
    }
  }
  t.plan(passesToTest.length)

  for (let p = 0, loopLength = passesToTest.length; p < loopLength; p++) {
    let passToTest = passesToTest[p]
    let numbersTest = passValidation.isWeakPass(passToTest, weakPassOptions)
    t.equal(numbersTest, true, `verifing password: ${passToTest}`)
  }
})

test('weak password test', (t) => {
  t.plan(17)
  var test1 = passValidation.isWeakPass('1234', strongSecurity)
  t.equal(test1, true)
  var test2 = passValidation.isWeakPass('123', strongSecurity)
  t.equal(test2, true)
  var test3 = passValidation.isWeakPass('aaaa', strongSecurity)
  t.equal(test3, true)
  var test4 = passValidation.isWeakPass('4321', strongSecurity)
  t.equal(test4, true)
  var test5 = passValidation.isWeakPass('8765', strongSecurity)
  t.equal(test5, true)
  var test6 = passValidation.isWeakPass('5678', strongSecurity)
  t.equal(test6, true)
  var test7 = passValidation.isWeakPass('qwer', strongSecurity)
  t.equal(test7, true)
  var test8 = passValidation.isWeakPass('dfgh', strongSecurity)
  t.equal(test8, true)
  var test9 = passValidation.isWeakPass('xcvb', strongSecurity)
  t.equal(test9, true)
  var test10 = passValidation.isWeakPass('0000', strongSecurity)
  t.equal(test10, true)
  var test11 = passValidation.isWeakPass('rrr', strongSecurity)
  t.equal(test11, true)
  var test12 = passValidation.isWeakPass('12qwe', strongSecurity)
  t.equal(test12, true)

  var test13 = passValidation.isWeakPass('ardr', strongSecurity)
  t.equal(test13, false)
  var test14 = passValidation.isWeakPass('4231', strongSecurity)
  t.equal(test14, false)

  var test15 = passValidation.isWeakPass('12345', lowSecurity)
  t.equal(test15, true)
  var test16 = passValidation.isWeakPass('iuytr', lowSecurity)
  t.equal(test16, true)
  var test17 = passValidation.isWeakPass('ABCDE', lowSecurity)
  t.equal(test17, true)
})
