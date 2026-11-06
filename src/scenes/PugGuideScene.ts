import Phaser from 'phaser';
import { AudioService } from '../audio/AudioService';
import { StorageService } from '../utils/StorageService';

type PugButtonConfig = {
  key: string;
  scene?: string;
  y: number;
  action?: () => void;
};

export class PugGuideScene extends Phaser.Scene {
  constructor() {
    super('PugGuideScene');
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const bg = this.add.image(width / 2, height / 2, 'pug_menu_bg');
    bg.setDisplaySize(width, height);

    this.cameras.main.fadeIn(350, 0, 0, 0);
    this.createButtons();
  }

  private createButtons(): void {
    const width = this.cameras.main.width;
    const buttons: PugButtonConfig[] = [
      { key: 'pug_btn_comenzar', y: 230, action: () => this.scene.start('PugLevel1Scene') },
      { key: 'pug_btn_enciclopedia', scene: 'PugEncyclopediaScene', y: 308 },
      { key: 'pug_btn_insignias', scene: 'PugBadgesScene', y: 386 },
      { key: 'pug_btn_ajustes', scene: 'PugSettingsScene', y: 464 },
      { key: 'pug_btn_creditos', scene: 'PugCreditsScene', y: 542 }
    ];

    buttons.forEach((button) => {
      const sprite = this.add.sprite(width / 2, button.y, button.key);
      const baseScale = 235 / sprite.width;
      sprite.setScale(baseScale);
      sprite.setInteractive({ useHandCursor: true });

      sprite.on('pointerover', () => {
        AudioService.playSFX('click');
        this.tweens.add({
          targets: sprite,
          scaleX: baseScale * 1.02,
          scaleY: baseScale * 1.02,
          duration: 110,
          ease: 'Back.easeOut'
        });
      });

      sprite.on('pointerout', () => {
        this.tweens.add({
          targets: sprite,
          scaleX: baseScale,
          scaleY: baseScale,
          duration: 110,
          ease: 'Sine.easeOut'
        });
      });

      sprite.on('pointerdown', () => {
        AudioService.playSFX('correct');
        this.tweens.add({
          targets: sprite,
          scaleX: baseScale * 0.95,
          scaleY: baseScale * 0.95,
          duration: 80,
          yoyo: true,
          onComplete: () => {
            if (button.action) {
              button.action();
              return;
            }

            if (button.scene) {
              this.scene.start(button.scene);
            }
          }
        });
      });
    });

    const backText = this.add.text(width - 30, 30, 'VOLVER', {
      font: 'bold 24px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#003f8f',
      strokeThickness: 5
    });
    backText.setOrigin(1, 0.5);
    backText.setInteractive({ useHandCursor: true });
    backText.on('pointerdown', () => {
      AudioService.playSFX('click');
      this.scene.start('MainMenuScene');
    });
  }
}
