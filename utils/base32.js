/**
 * base32 decode taken from: https://github.com/LinusU/base32-decode/blob/master/index.js
 * base32 encode taken from: https://github.com/LinusU/base32-encode/blob/master/index.js
 */

var RFC4648 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
var RFC4648_HEX = '0123456789ABCDEFGHIJKLMNOPQRSTUV'
var CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

function readChar(alphabet, char) {
  var idx = alphabet.indexOf(char)

  if (idx === -1) {
    throw new Error('Invalid character found: ' + char)
  }

  return idx
}

function decode(input, variant) {
  var alphabet

  switch (variant) {
    case 'RFC3548':
    case 'RFC4648':
      alphabet = RFC4648
      input = input.replace(/=+$/, '')
      break
    case 'RFC4648-HEX':
      alphabet = RFC4648_HEX
      input = input.replace(/=+$/, '')
      break
    case 'Crockford':
      alphabet = CROCKFORD
      input = input.toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1')
      break
    default:
      throw new Error('Unknown base32 variant: ' + variant)
  }

  var length = input.length

  var bits = 0
  var value = 0

  var index = 0
  var output = new Uint8Array(((length * 5) / 8) | 0)

  for (var i = 0; i < length; i++) {
    value = (value << 5) | readChar(alphabet, input[i])
    bits += 5

    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255
      bits -= 8
    }
  }

  return output.buffer
}

function encode(buffer, variant, options) {
  options = options || {}
  var alphabet, defaultPadding

  switch (variant) {
    case 'RFC3548':
    case 'RFC4648':
      alphabet = RFC4648
      defaultPadding = true
      break
    case 'RFC4648-HEX':
      alphabet = RFC4648_HEX
      defaultPadding = true
      break
    case 'Crockford':
      alphabet = CROCKFORD
      defaultPadding = false
      break
    default:
      throw new Error('Unknown base32 variant: ' + variant)
  }

  var padding = options.padding !== undefined ? options.padding : defaultPadding
  var length = buffer.byteLength
  var view = new Uint8Array(buffer)

  var bits = 0
  var value = 0
  var output = ''

  for (var i = 0; i < length; i++) {
    value = (value << 8) | view[i]
    bits += 8

    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }

  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31]
  }

  if (padding) {
    while (output.length % 8 !== 0) {
      output += '='
    }
  }

  return output
}

module.exports = base32 = { decode, encode }
