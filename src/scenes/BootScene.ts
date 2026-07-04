import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {}

  create(): void {
    // Configuración obligatoria para la versión móvil (APK)
    this.registry.set('isMobile', true);
    this.registry.set('controlType', 'pointer'); // Seguir el toque en la pantalla
    
    // Ir directo a la siguiente escena sin hacer preguntas
    this.scene.start('PreloadScene');
  }
}
