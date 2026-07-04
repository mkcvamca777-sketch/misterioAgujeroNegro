# Misterio en el Agujero Negro - Resumen del Proyecto

Este documento describe las partes más importantes y centrales del videojuego.

## 1. Tecnologías Principales
- **TypeScript**: El lenguaje de programación que controla toda la lógica y reglas del juego.
- **Phaser 3**: El motor de físicas y gráficos que da vida a las colisiones, el dibujo de la nave y la gravedad.

## 2. Archivos y Escenas Clave
El juego está dividido en "Escenas", que son los diferentes archivos donde ocurre la acción:

- **`BootScene.ts`**: La primera pantalla del juego. Aquí se detecta si estás en celular o computadora y se elige cómo vas a controlar la nave.
- **`MainMenuScene.ts`**: El menú principal donde puedes elegir ir a la enciclopedia, ver tus medallas o iniciar los niveles.
- **`GameScene.ts` (Nivel 1)**: Nivel del agujero negro. Destaca por el uso de Gravedad Atractiva (física).
- **`Level2Scene.ts` (Nivel 2)**: Nivel de la enana roja. Destaca por la generación de asteroides y obstáculos móviles.
- **`Level4Scene.ts` (Nivel 4)**: Nivel del agujero de gusano. Transformado en un veloz *Runner* vertical donde debes esquivar anomalías moviéndote solo de izquierda a derecha.

## 3. Características Especiales

- **Arte por Código**: No requiere descargar imágenes externas para la nave o los asteroides; todo se dibuja matemáticamente (con `Phaser.GameObjects.Graphics`), haciendo que el juego cargue al instante.
- **Preguntas Interactivas**: Los niveles se pausan y te hacen preguntas sobre el espacio. Tienes que responder correctamente para avanzar, dándole su aspecto educativo.
- **Insignias y Progreso Local**: Al superar niveles, ganas medallas que se guardan en el `localStorage` de tu navegador gracias al archivo `StorageService.ts`. No pierdes tu progreso al salir.
- **Multiplataforma (PC y Móvil)**: La nave puede controlarse con el teclado, con el ratón (la nave sigue tu cursor), o usando botones táctiles virtuales si juegas desde tu teléfono.

## 4. Despliegue (Cómo se sube a Internet)
El proyecto está configurado para poder ejecutarse en cualquier lugar usando contenedores:
- **`Dockerfile`**: Contiene las instrucciones para que el juego se compile con Vite y se publique usando un servidor Nginx, ideal para ser alojado en **Dockploy**.

## 5. Código Principal (`main.ts`)
Este es el "punto de entrada" del juego, que carga las configuraciones, establece el motor de físicas e inicia todas las pantallas:

```typescript
import Phaser from 'phaser';
import './style.css';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { GameScene } from './scenes/GameScene';
import { Level2Scene } from './scenes/Level2Scene';
import { Level3Scene } from './scenes/Level3Scene';
import { Level4Scene } from './scenes/Level4Scene';
import { EncyclopediaScene } from './scenes/EncyclopediaScene';
import { BadgesScene } from './scenes/BadgesScene';
import { ConfigScene } from './scenes/ConfigScene';
import { CreditsScene } from './scenes/CreditsScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1024,
  height: 576,
  parent: 'game-container',
  backgroundColor: '#0a051b',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [
    BootScene, PreloadScene, MainMenuScene, GameScene, 
    Level2Scene, Level3Scene, Level4Scene, EncyclopediaScene, 
    BadgesScene, ConfigScene, CreditsScene
  ]
};

// Se inicia el motor cuando carga la página web
window.addEventListener('load', () => {
  new Phaser.Game(config);
});
```
