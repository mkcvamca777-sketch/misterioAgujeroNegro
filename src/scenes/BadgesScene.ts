import Phaser from 'phaser';
import { AudioService } from '../audio/AudioService';
import { StorageService } from '../utils/StorageService';

export class BadgesScene extends Phaser.Scene {
  private badgeList = [
    { id: 'cazador', name: 'Cazador de Agujeros', desc: 'Completaste el Nivel 1.', iconColor: 0x00e5ff },
    { id: 'navegante', name: 'Navegante Experto', desc: 'Sobreviviste al Nivel 2.', iconColor: 0xffaa00 },
    { id: 'astronomo', name: 'Astrónomo Mayor', desc: 'Completaste el Nivel 3.', iconColor: 0x00e676 },
    { id: 'viajero', name: 'Viajero del Tiempo', desc: 'Superaste el Nivel 4.', iconColor: 0xe040fb },
    { id: 'agujero_negro', name: 'Investigador Agujeros', desc: 'Completaste el Nivel 5.', iconColor: 0xff3d00 }
  ];

  constructor() {
    super('BadgesScene');
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Dark background
    const bg = this.add.graphics();
    bg.fillStyle(0x070314, 1);
    bg.fillRect(0, 0, width, height);

    // Stars
    for (let i = 0; i < 50; i++) {
      this.add.circle(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), Phaser.Math.FloatBetween(0.5, 1.5), 0xffffff, Phaser.Math.FloatBetween(0.2, 0.5));
    }

    // Window Panel
    const panel = this.add.graphics();
    panel.fillStyle(0x130c2c, 0.95);
    panel.lineStyle(4, 0x4caf50, 1);
    panel.fillRoundedRect(width / 2 - 420, height / 2 - 240, 840, 480, 20);
    panel.strokeRoundedRect(width / 2 - 420, height / 2 - 240, 840, 480, 20);

    // Header Title
    this.add.text(width / 2, height / 2 - 195, 'GALERÍA DE INSIGNIAS', {
      font: 'bold 32px "Outfit", "Inter", sans-serif',
      color: '#4caf50'
    }).setOrigin(0.5);

    const unlockedBadges = StorageService.getBadges();
    
    // No default unlock needed anymore

    // Draw badges in a 3-column layout, centering the second row
    this.badgeList.forEach((badge, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);

      // Calculate x, centering the second row which has only 2 items
      let x = width / 2 - 270 + (col * 270);
      if (row === 1) {
        x = width / 2 - 135 + (col * 270);
      }
      const y = height / 2 - 80 + (row * 135);

      const isUnlocked = unlockedBadges.includes(badge.id);

      // Draw card (width: 250, height: 110)
      const card = this.add.graphics();
      card.fillStyle(isUnlocked ? 0x221743 : 0x1b172b, 0.9);
      card.lineStyle(2, isUnlocked ? badge.iconColor : 0x555555, 1);
      card.fillRoundedRect(x - 125, y - 55, 250, 110, 12);
      card.strokeRoundedRect(x - 125, y - 55, 250, 110, 12);

      // Icon circle (radius: 32)
      const iconBg = this.add.graphics();
      iconBg.fillStyle(isUnlocked ? badge.iconColor : 0x444444, 1);
      iconBg.fillCircle(x - 75, y, 32);

      // Simple Star inside icon
      const star = this.add.text(x - 75, y, isUnlocked ? '★' : '?', {
        font: 'bold 28px "Outfit", sans-serif',
        color: '#ffffff'
      }).setOrigin(0.5);

      // Text names
      this.add.text(x - 30, y - 35, badge.name, {
        font: 'bold 16px "Outfit", "Inter", sans-serif',
        color: isUnlocked ? '#ffffff' : '#888888'
      });

      this.add.text(x - 30, y - 8, badge.desc, {
        font: '13px "Outfit", "Inter", sans-serif',
        color: isUnlocked ? '#b0bec5' : '#666666',
        wordWrap: { width: 145 }
      });

      // Simple hover effect
      if (isUnlocked) {
        const cardZone = this.add.zone(x, y, 250, 110).setInteractive({ useHandCursor: true });
        cardZone.on('pointerover', () => {
          this.tweens.add({
            targets: [star],
            scale: 1.25,
            duration: 150,
            yoyo: true
          });
        });
      }
    });

    // Close button
    const btnBack = this.add.graphics();
    btnBack.fillStyle(0xff5722, 1);
    btnBack.fillRoundedRect(width / 2 - 100, height / 2 + 180, 200, 40, 8);

    this.add.text(width / 2, height / 2 + 200, 'MENÚ PRINCIPAL', {
      font: 'bold 16px "Outfit", "Inter", sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5);

    const backZone = this.add.zone(width / 2, height / 2 + 200, 200, 40).setInteractive({ useHandCursor: true });
    backZone.on('pointerdown', () => {
      AudioService.playSFX('click');
      this.cameras.main.fadeOut(400, 10, 5, 27);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('MainMenuScene');
      });
    });
  }
}
