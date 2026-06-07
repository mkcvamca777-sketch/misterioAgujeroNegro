import Phaser from 'phaser';
import { AudioService } from '../audio/AudioService';
import { StorageService } from '../utils/StorageService';

export class BadgesScene extends Phaser.Scene {
  private badgeList = [
    { id: 'cadete', name: 'Cadete Espacial', desc: 'Iniciaste el viaje científico.', iconColor: 0xffaa00 },
    { id: 'cazador', name: 'Cazador de Agujeros', desc: 'Completaste el Nivel 1 del espacio.', iconColor: 0x00e5ff },
    { id: 'fisico', name: 'Físico Teórico', desc: 'Exploraste toda la Enciclopedia.', iconColor: 0x00e676 },
    { id: 'maestro', name: 'Maestro Cósmico', desc: '¡Dominaste el misterio del agujero negro!', iconColor: 0xe040fb }
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
    
    // Auto-unlock Físico badge if they unlocked the scene, just as an easter egg for exploring
    StorageService.unlockBadge('cadete'); // Always unlocked when they visit here first time

    // Draw badges in a 2x2 grid
    this.badgeList.forEach((badge, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);

      const x = width / 2 - 200 + (col * 400);
      const y = height / 2 - 80 + (row * 170);

      const isUnlocked = unlockedBadges.includes(badge.id) || badge.id === 'cadete';

      // Draw card
      const card = this.add.graphics();
      card.fillStyle(isUnlocked ? 0x221743 : 0x1b172b, 0.9);
      card.lineStyle(2, isUnlocked ? badge.iconColor : 0x555555, 1);
      card.fillRoundedRect(x - 180, y - 60, 360, 120, 12);
      card.strokeRoundedRect(x - 180, y - 60, 360, 120, 12);

      // Icon circle
      const iconBg = this.add.graphics();
      iconBg.fillStyle(isUnlocked ? badge.iconColor : 0x444444, 1);
      iconBg.fillCircle(x - 110, y, 40);

      // Simple Star inside icon
      const star = this.add.text(x - 110, y, isUnlocked ? '★' : '?', {
        font: 'bold 36px "Outfit", sans-serif',
        color: '#ffffff'
      }).setOrigin(0.5);

      // Text names
      this.add.text(x - 50, y - 35, badge.name, {
        font: 'bold 20px "Outfit", "Inter", sans-serif',
        color: isUnlocked ? '#ffffff' : '#888888'
      });

      this.add.text(x - 50, y - 5, badge.desc, {
        font: '14px "Outfit", "Inter", sans-serif',
        color: isUnlocked ? '#b0bec5' : '#666666',
        wordWrap: { width: 210 }
      });

      // Simple hover effect
      if (isUnlocked) {
        const cardZone = this.add.zone(x, y, 360, 120).setInteractive({ useHandCursor: true });
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
