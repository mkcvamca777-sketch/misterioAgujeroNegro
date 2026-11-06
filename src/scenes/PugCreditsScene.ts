import Phaser from 'phaser';
import { AudioService } from '../audio/AudioService';
import { createPugSubmarine } from '../utils/PugOceanArt';

export class PugCreditsScene extends Phaser.Scene {
  constructor() {
    super('PugCreditsScene');
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.cameras.main.fadeIn(350, 0, 20, 45);
    this.drawCalmOcean();

    const sub = createPugSubmarine(this, width / 2 + 330, height - 95, 4, false);
    sub.setScale(0.46);
    sub.setAlpha(0.72);

    const panel = this.add.graphics();
    panel.fillStyle(0xeafbff, 0.9);
    panel.fillRoundedRect(width / 2 - 365, 76, 730, 390, 26);
    panel.lineStyle(6, 0x42dff5, 1);
    panel.strokeRoundedRect(width / 2 - 365, 76, 730, 390, 26);
    panel.lineStyle(2, 0xffffff, 0.9);
    panel.strokeRoundedRect(width / 2 - 346, 95, 692, 352, 18);

    this.add.text(width / 2, 124, 'CRÉDITOS', {
      font: 'bold 52px "Outfit", "Inter", Arial, sans-serif',
      color: '#005f99',
      stroke: '#ffffff',
      strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(width / 2, 205, 'PROGRAMACIÓN', {
      font: 'bold 34px "Outfit", "Inter", Arial, sans-serif',
      color: '#003f66'
    }).setOrigin(0.5);

    this.add.text(width / 2, 246, 'Valentina Micaela Céspedes Álvarez', {
      font: 'bold 31px "Outfit", "Inter", Arial, sans-serif',
      color: '#175676'
    }).setOrigin(0.5);

    this.add.text(width / 2, 315, 'FONDOS Y BOTONES', {
      font: 'bold 34px "Outfit", "Inter", Arial, sans-serif',
      color: '#003f66'
    }).setOrigin(0.5);

    this.add.text(width / 2, 366, 'Mila Marín Gonzales\nValentina Micaela Céspedes Álvarez', {
      font: 'bold 31px "Outfit", "Inter", Arial, sans-serif',
      color: '#175676',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5);

    const back = this.add.text(width / 2, 515, '← VOLVER AL MENÚ', {
      font: 'bold 30px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      backgroundColor: '#008ec4',
      padding: { x: 24, y: 12 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    back.on('pointerover', () => back.setScale(1.05));
    back.on('pointerout', () => back.setScale(1));
    back.on('pointerdown', () => {
      AudioService.playSFX('click');
      this.scene.start('PugGuideScene');
    });
  }

  private drawCalmOcean(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x7fd8f5, 0x49b6d8, 0x0d5b89, 0x052846, 1);
    bg.fillRect(0, 0, width, height);

    for (let i = 0; i < 18; i++) {
      const y = 92 + i * 27;
      const wave = this.add.graphics();
      wave.lineStyle(3, 0xe9fbff, 0.13);
      wave.beginPath();
      wave.moveTo(0, y);
      for (let x = 0; x <= width; x += 78) {
        wave.lineTo(x, y + Math.sin((x + i * 33) / 80) * 7);
      }
      wave.strokePath();
    }

    for (let i = 0; i < 34; i++) {
      const bubble = this.add.circle(
        Phaser.Math.Between(25, width - 25),
        Phaser.Math.Between(90, height + 60),
        Phaser.Math.FloatBetween(2, 6),
        0xeafbff,
        Phaser.Math.FloatBetween(0.14, 0.35)
      );
      this.tweens.add({
        targets: bubble,
        y: bubble.y - Phaser.Math.Between(40, 110),
        alpha: 0.04,
        duration: Phaser.Math.Between(3200, 6800),
        yoyo: true,
        repeat: -1
      });
    }
  }
}
