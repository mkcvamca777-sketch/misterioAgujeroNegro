import Phaser from 'phaser';
import { AudioService } from '../audio/AudioService';

export class CreditsScene extends Phaser.Scene {
  constructor() {
    super('CreditsScene');
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Dark Background
    const bg = this.add.graphics();
    bg.fillStyle(0x04020f, 1);
    bg.fillRect(0, 0, width, height);

    // Stars
    for (let i = 0; i < 40; i++) {
      this.add.circle(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), Phaser.Math.FloatBetween(0.5, 1.5), 0xffffff, Phaser.Math.FloatBetween(0.1, 0.4));
    }

    // Modal panel background
    const panel = this.add.graphics();
    panel.fillStyle(0x110b27, 0.95);
    panel.lineStyle(4, 0x673ab7, 1);
    panel.fillRoundedRect(width / 2 - 250, height / 2 - 200, 500, 400, 16);
    panel.strokeRoundedRect(width / 2 - 250, height / 2 - 200, 500, 400, 16);

    // Title
    this.add.text(width / 2, height / 2 - 150, 'CRÉDITOS', {
      font: 'bold 36px "Outfit", "Inter", sans-serif',
      color: '#e040fb'
    }).setOrigin(0.5);

    // Development info
    this.add.text(width / 2, height / 2 + 10, 
      'Diseño & Programación:\nAntigravity AI\n\nIlustraciones & Arte:\nProfesor Pibble Studio\n\nMotor de Juego:\nPhaser 3\n\nAudio Engine:\nHowler.js\n\n¡Gracias por jugar y aprender!', 
      {
        font: '20px "Outfit", "Inter", sans-serif',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 10
      }
    ).setOrigin(0.5);

    // Back button
    const btnBack = this.add.graphics();
    btnBack.fillStyle(0xff5722, 1);
    btnBack.fillRoundedRect(width / 2 - 100, height / 2 + 120, 200, 40, 8);

    this.add.text(width / 2, height / 2 + 140, 'MENÚ PRINCIPAL', {
      font: 'bold 16px "Outfit", "Inter", sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5);

    const backZone = this.add.zone(width / 2, height / 2 + 140, 200, 40).setInteractive({ useHandCursor: true });
    backZone.on('pointerdown', () => {
      AudioService.playSFX('click');
      this.cameras.main.fadeOut(400, 10, 5, 27);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('MainMenuScene');
      });
    });
  }
}
