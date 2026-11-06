import Phaser from 'phaser';
import './style.css';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { GameScene } from './scenes/GameScene';
import { Level2Scene } from './scenes/Level2Scene';
import { Level3Scene } from './scenes/Level3Scene';
import { Level4Scene } from './scenes/Level4Scene';
import { Level5Scene } from './scenes/Level5Scene';
import { EncyclopediaScene } from './scenes/EncyclopediaScene';
import { BadgesScene } from './scenes/BadgesScene';
import { ConfigScene } from './scenes/ConfigScene';
import { CreditsScene } from './scenes/CreditsScene';
import { PugGuideScene } from './scenes/PugGuideScene';
import { PugLevel1Scene } from './scenes/PugLevel1Scene';
import { PugLevel2Scene } from './scenes/PugLevel2Scene';
import { PugLevel3Scene } from './scenes/PugLevel3Scene';
import { PugLevel4Scene } from './scenes/PugLevel4Scene';
import { PugLevel5Scene } from './scenes/PugLevel5Scene';
import { PugEncyclopediaScene } from './scenes/PugEncyclopediaScene';
import { PugBadgesScene } from './scenes/PugBadgesScene';
import { PugSettingsScene } from './scenes/PugSettingsScene';
import { PugCreditsScene } from './scenes/PugCreditsScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
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
    BootScene,
    PreloadScene,
    MainMenuScene,
    GameScene,
    Level2Scene,
    Level3Scene,
    Level4Scene,
    Level5Scene,
    EncyclopediaScene,
    BadgesScene,
    ConfigScene,
    CreditsScene,
    PugGuideScene,
    PugLevel1Scene,
    PugLevel2Scene,
    PugLevel3Scene,
    PugLevel4Scene,
    PugLevel5Scene,
    PugEncyclopediaScene,
    PugBadgesScene,
    PugSettingsScene,
    PugCreditsScene
  ]
};

// Start the game when the window loads
window.addEventListener('load', () => {
  new Phaser.Game(config);
});
