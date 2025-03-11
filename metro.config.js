const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Obtenez la configuration par défaut
const defaultConfig = getDefaultConfig(__dirname);

// Ajoutez les résolutions pour les modules Node.js
defaultConfig.resolver.extraNodeModules = {
  stream: require.resolve('readable-stream'),
  crypto: require.resolve('react-native-crypto'),
  net: require.resolve('react-native-tcp-socket'),
  buffer: require.resolve('buffer'),
  util: require.resolve('util'),
  string_decoder: require.resolve('string_decoder'),
  'safe-buffer': require.resolve('safe-buffer'),
  inherits: require.resolve('inherits'),
  events: require.resolve('events'),
  process: require.resolve('process/browser'),
  vm: require.resolve('vm-browserify'),
  zlib: require.resolve('browserify-zlib'),
  path: require.resolve('path-browserify'),
  fs: false,
  http: require.resolve('@tradle/react-native-http'),
  https: require.resolve('https-browserify'),
  os: require.resolve('os-browserify/browser'),
  querystring: require.resolve('querystring-es3'),
  url: require.resolve('url'),
  assert: require.resolve('assert'),
  constants: require.resolve('constants-browserify'),
  domain: require.resolve('domain-browser'),
  dgram: false,
  dns: false,
  tls: false,
  child_process: false,
  cluster: false,
};

// Assurez-vous que les extensions sont correctement configurées
defaultConfig.resolver.sourceExts = [...defaultConfig.resolver.sourceExts, 'cjs', 'mjs'];

module.exports = defaultConfig; 