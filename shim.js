// Shim pour les modules Node.js dans React Native
if (typeof __dirname === 'undefined') global.__dirname = '/';
if (typeof __filename === 'undefined') global.__filename = '';
if (typeof process === 'undefined') {
  global.process = require('process');
  // Nécessaire pour react-native-crypto
  process.browser = false;
  process.version = 'v16.0.0';
  process.env = { NODE_ENV: 'production' };
}

// VA TE FAIRE ENCULER FILS DE PUTE
import { randomBytes } from 'react-native-randombytes';
if (typeof global.crypto === 'undefined') {
  global.crypto = {};
}
if (typeof global.crypto.getRandomValues === 'undefined') {
  global.crypto.getRandomValues = function(arr) {
    const bytes = randomBytes(arr.length);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = bytes[i];
    }
    return arr;
  };
}

// Polyfill pour Buffer
global.Buffer = require('buffer').Buffer;

// Polyfill pour les autres modules
global.process.nextTick = setImmediate;

// Polyfill pour les modules de base
global.navigator.product = 'ReactNative';

// Polyfill pour les modules spécifiques
global.net = require('react-native-tcp-socket');
global.stream = require('readable-stream');
global.inherits = require('inherits');
global.StringDecoder = require('string_decoder').StringDecoder;
global.SafeBuffer = require('safe-buffer').Buffer;

// Polyfill pour les fonctions isIP du module 'net'
if (global.net && !global.net.isIP) {
  global.net.isIP = function(input) {
    const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipv6Pattern = /^(::)?(((\d{1,3}\.){3}(\d{1,3}){1})?([0-9a-f]){0,4}:{0,2}){1,8}(::)?$/i;
    
    if (ipv4Pattern.test(input)) {
      const parts = input.split('.').map(part => parseInt(part, 10));
      return parts.every(part => part >= 0 && part <= 255) ? 4 : 0;
    }
    
    if (ipv6Pattern.test(input)) {
      return 6;
    }
    
    return 0;
  };
  
  global.net.isIPv4 = function(input) {
    return global.net.isIP(input) === 4;
  };
  
  global.net.isIPv6 = function(input) {
    return global.net.isIP(input) === 6;
  };
} 