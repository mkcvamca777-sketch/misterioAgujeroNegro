import Phaser from 'phaser';
import { AudioService } from '../audio/AudioService';

export class ConfigScene extends Phaser.Scene {
  constructor() {
    super('ConfigScene');
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Background cosmic wash
    const overlay = this.add.graphics();
    overlay.fillStyle(0x0a051b, 1);
    overlay.fillRect(0, 0, width, height);

    // Draw some glowing decorative stars
    for (let i = 0; i < 40; i++) {
      this.add.circle(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), Phaser.Math.FloatBetween(0.5, 2), 0xffffff, Phaser.Math.FloatBetween(0.1, 0.6));
    }

    // Modal panel background
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1235, 0.95);
    panel.lineStyle(4, 0x673ab7, 1);
    panel.fillRoundedRect(width / 2 - 250, height / 2 - 220, 500, 440, 16);
    panel.strokeRoundedRect(width / 2 - 250, height / 2 - 220, 500, 440, 16);

    // Title
    this.add.text(width / 2, height / 2 - 170, 'CONFIGURACIÓN', {
      font: 'bold 36px "Outfit", "Inter", sans-serif',
      color: '#ffc107'
    }).setOrigin(0.5);

    // MUTE OPTION
    this.add.text(width / 2 - 150, height / 2 - 90, 'Silenciar Todo:', {
      font: '24px "Outfit", "Inter", sans-serif',
      color: '#ffffff'
    });
    
    const muteCheckbox = this.add.graphics();
    const drawCheckbox = (muted: boolean) => {
      muteCheckbox.clear();
      muteCheckbox.fillStyle(0x312450, 1);
      muteCheckbox.lineStyle(2, 0x9c27b0, 1);
      muteCheckbox.fillRoundedRect(width / 2 + 80, height / 2 - 95, 30, 30, 6);
      muteCheckbox.strokeRoundedRect(width / 2 + 80, height / 2 - 95, 30, 30, 6);
      if (muted) {
        muteCheckbox.fillStyle(0x00e676, 1);
        muteCheckbox.fillRoundedRect(width / 2 + 86, height / 2 - 89, 18, 18, 4);
      }
    };
    
    // Check if initially muted
    let isMuted = (AudioService.getMusicVolume() === 0 && AudioService.getSFXVolume() === 0);
    drawCheckbox(isMuted);

    const checkboxZone = this.add.zone(width / 2 + 95, height / 2 - 80, 50, 50);
    checkboxZone.setInteractive({ useHandCursor: true });
    checkboxZone.on('pointerdown', () => {
      isMuted = AudioService.toggleMute();
      drawCheckbox(isMuted);
      AudioService.playSFX('click');
    });

    // MUSIC VOLUME
    this.add.text(width / 2 - 150, height / 2 - 20, 'Música de Fondo:', {
      font: '20px "Outfit", "Inter", sans-serif',
      color: '#b3e5fc'
    });

    const musicBar = this.add.graphics();
    const updateMusicBar = (val: number) => {
      musicBar.clear();
      // Background slot
      musicBar.fillStyle(0x312450, 1);
      musicBar.fillRoundedRect(width / 2 - 150, height / 2 + 15, 300, 12, 6);
      // Filled level
      musicBar.fillStyle(0xffa500, 1);
      musicBar.fillRoundedRect(width / 2 - 150, height / 2 + 15, 300 * val, 12, 6);
      // Handle node
      musicBar.fillStyle(0xffffff, 1);
      musicBar.fillCircle(width / 2 - 150 + 300 * val, height / 2 + 21, 10);
    };

    let musicVol = AudioService.getMusicVolume();
    updateMusicBar(musicVol);

    const musicZone = this.add.zone(width / 2, height / 2 + 21, 320, 30).setInteractive({ useHandCursor: true });
    this.input.setDraggable(musicZone);
    
    const handleMusicDrag = (pointer: Phaser.Input.Pointer) => {
      const relX = Phaser.Math.Clamp(pointer.x - (width / 2 - 150), 0, 300);
      musicVol = relX / 300;
      updateMusicBar(musicVol);
      AudioService.setMusicVolume(musicVol);
      if (isMuted && musicVol > 0) {
        isMuted = false;
        drawCheckbox(false);
      }
    };
    musicZone.on('pointerdown', handleMusicDrag);
    musicZone.on('drag', handleMusicDrag);

    // SFX VOLUME
    this.add.text(width / 2 - 150, height / 2 + 60, 'Efectos de Sonido:', {
      font: '20px "Outfit", "Inter", sans-serif',
      color: '#b3e5fc'
    });

    const sfxBar = this.add.graphics();
    const updateSFXBar = (val: number) => {
      sfxBar.clear();
      // Background slot
      sfxBar.fillStyle(0x312450, 1);
      sfxBar.fillRoundedRect(width / 2 - 150, height / 2 + 95, 300, 12, 6);
      // Filled level
      sfxBar.fillStyle(0x00e676, 1);
      sfxBar.fillRoundedRect(width / 2 - 150, height / 2 + 95, 300 * val, 12, 6);
      // Handle node
      sfxBar.fillStyle(0xffffff, 1);
      sfxBar.fillCircle(width / 2 - 150 + 300 * val, height / 2 + 101, 10);
    };

    let sfxVol = AudioService.getSFXVolume();
    updateSFXBar(sfxVol);

    const sfxZone = this.add.zone(width / 2, height / 2 + 101, 320, 30).setInteractive({ useHandCursor: true });
    this.input.setDraggable(sfxZone);

    const handleSFXDrag = (pointer: Phaser.Input.Pointer) => {
      const relX = Phaser.Math.Clamp(pointer.x - (width / 2 - 150), 0, 300);
      sfxVol = relX / 300;
      updateSFXBar(sfxVol);
      AudioService.setSFXVolume(sfxVol);
      if (isMuted && sfxVol > 0) {
        isMuted = false;
        drawCheckbox(false);
      }
    };
    sfxZone.on('pointerdown', handleSFXDrag);
    sfxZone.on('drag', handleSFXDrag);
    sfxZone.on('dragend', () => {
      AudioService.playSFX('click');
    });

    // BACK TO MAIN MENU BUTTON
    const btnBack = this.add.graphics();
    btnBack.fillStyle(0xff5722, 1);
    btnBack.fillRoundedRect(width / 2 - 100, height / 2 + 140, 200, 50, 10);

    const btnBackText = this.add.text(width / 2, height / 2 + 165, 'VOLVER', {
      font: 'bold 20px "Outfit", "Inter", sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5);

    const backZone = this.add.zone(width / 2, height / 2 + 165, 200, 50).setInteractive({ useHandCursor: true });
    
    backZone.on('pointerover', () => {
      this.tweens.add({
        targets: [btnBack, btnBackText],
        scale: 1.05,
        x: (targets: any) => targets === btnBack ? width / 2 - 105 : width / 2,
        y: (targets: any) => targets === btnBack ? height / 2 + 137.5 : height / 2 + 165,
        duration: 100
      });
    });

    backZone.on('pointerout', () => {
      btnBack.setScale(1);
      btnBack.setPosition(0, 0);
      btnBackText.setScale(1);
      btnBackText.setPosition(width / 2, height / 2 + 165);
    });

    backZone.on('pointerdown', () => {
      AudioService.playSFX('click');
      this.cameras.main.fadeOut(400, 10, 5, 27);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('MainMenuScene');
      });
    });
  }
}
