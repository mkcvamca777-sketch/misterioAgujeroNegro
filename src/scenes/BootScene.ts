import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    // Load minimal asset for loading bar if desired (optional)
  }

  create(): void {
    // Setup general configurations if any, then proceed to PreloadScene
    this.scene.start('PreloadScene');
  }
}
