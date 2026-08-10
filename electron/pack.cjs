process.env.DEBUG = 'electron-packager';
const packager = require('electron-packager');

console.log('Iniciando empaquetado con electron-packager...');

packager({
  dir: '.',
  name: 'ElMisterioDelAgujeroNegro',
  platform: 'win32',
  arch: 'x64',
  out: 'dist_desktop',
  overwrite: true,
  ignore: [
    /^\/android/,
    /^\/src/,
    /^\/public/,
    /^\/dist_desktop/,
    /^\/\.git/,
    /^\/\.github/,
    /capacitor\.config\.ts/,
    /tsconfig\.json/,
    /vite\.config\.ts/
  ]
}).then(appPaths => {
  console.log('¡Juego empaquetado exitosamente en:', appPaths);
}).catch(err => {
  console.error('Error al empaquetar el juego:', err);
  process.exit(1);
});
