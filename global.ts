// Polyfills pour les modules Node.js dans React Native
import 'react-native-polyfill-globals/auto';

// Initialiser randomBytes avant d'importer react-native-crypto
import { randomBytes } from 'react-native-randombytes';
global.randomBytes = randomBytes;

// Maintenant on peut importer react-native-crypto
import 'react-native-crypto';
import TcpSocket from 'react-native-tcp-socket';

// Importer les polyfills
import { Buffer } from 'buffer';
import Stream from 'readable-stream';
import StringDecoder from 'string_decoder';
import SafeBuffer from 'safe-buffer';
import inherits from 'inherits';

// Configurer le polyfill pour crypto
if (typeof global.crypto !== 'object') {
  global.crypto = {};
}

if (typeof global.crypto.getRandomValues !== 'function') {
  global.crypto.getRandomValues = function(arr: Uint8Array) {
    const bytes = randomBytes(arr.length);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = bytes[i];
    }
    return arr;
  };
}

// Polyfill pour le module 'crypto' de Node.js
global.process = global.process || {};
global.process.env = global.process.env || {};
global.process.browser = false;

// Polyfill pour Buffer
if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

// Polyfill pour le module 'net' de Node.js
if (!global.net) {
  global.net = TcpSocket;
}

// Polyfill pour les fonctions isIP du module 'net'
if (global.net && !global.net.isIP) {
  global.net.isIP = function(input: string): number {
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
  
  global.net.isIPv4 = function(input: string): boolean {
    return global.net.isIP(input) === 4;
  };
  
  global.net.isIPv6 = function(input: string): boolean {
    return global.net.isIP(input) === 6;
  };
}

// Polyfill pour le module 'stream'
if (!global.stream) {
  global.stream = Stream;
}

// Polyfill pour string_decoder
if (!global.StringDecoder) {
  global.StringDecoder = StringDecoder;
}

// Polyfill pour safe-buffer
if (!global.SafeBuffer) {
  global.SafeBuffer = SafeBuffer;
}

// Polyfill pour inherits
if (!global.inherits) {
  global.inherits = inherits;
}

export {}; 