import Phaser from 'phaser';
import { AudioService } from '../audio/AudioService';

type ToggleButton = {
  label: Phaser.GameObjects.Text;
  bg: Phaser.GameObjects.Graphics;
  value: string;
};

export class PugSettingsScene extends Phaser.Scene {
  private musicBar!: Phaser.GameObjects.Graphics;
  private sfxBar!: Phaser.GameObjects.Graphics;
  private fullscreenButtons: ToggleButton[] = [];
  private languageButtons: ToggleButton[] = [];
  private language = 'Español';

  constructor() {
    super('PugSettingsScene');
  }

  create(): void {
    this.cameras.main.fadeIn(350, 0, 18, 45);
    this.drawBackground();
    this.createTitle();
    this.createSettingsPanel();
    this.createBackButton();
  }

  private drawBackground(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x25c7da, 0x0f8bb8, 0x06345d, 0x021326, 1);
    bg.fillRect(0, 0, width, height);

    for (let i = 0; i < 16; i++) {
      const y = 95 + i * 30;
      const wave = this.add.graphics();
      wave.lineStyle(3, 0xd8f7ff, 0.08);
      wave.beginPath();
      wave.moveTo(0, y);
      for (let x = 0; x <= width; x += 70) {
        wave.lineTo(x, y + Math.sin((x + i * 45) / 75) * 8);
      }
      wave.strokePath();
    }
  }

  private createTitle(): void {
    const width = this.cameras.main.width;
    this.add.text(width / 2, 42, 'AJUSTES', {
      font: 'bold 52px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#00304f',
      strokeThickness: 8
    }).setOrigin(0.5);
  }

  private createSettingsPanel(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const panel = this.add.graphics();
    panel.fillStyle(0xeafbff, 0.94);
    panel.fillRoundedRect(width / 2 - 430, 92, 860, 410, 28);
    panel.lineStyle(6, 0x45e3ff, 1);
    panel.strokeRoundedRect(width / 2 - 430, 92, 860, 410, 28);
    panel.lineStyle(2, 0xffffff, 0.85);
    panel.strokeRoundedRect(width / 2 - 413, 109, 826, 376, 22);

    this.createGearButton(width / 2, 122);
    this.createSlider('MUSICA', 284, 205, AudioService.getMusicVolume(), (value) => {
      AudioService.setMusicVolume(value);
      this.drawSlider(this.musicBar, 420, 205, value);
    }, true);
    this.createSlider('EFECTOS', 284, 275, AudioService.getSFXVolume(), (value) => {
      AudioService.setSFXVolume(value);
      this.drawSlider(this.sfxBar, 420, 275, value);
    }, false);

    this.add.text(284, 342, 'PANTALLA COMPLETA', {
      font: 'bold 30px "Outfit", "Inter", Arial, sans-serif',
      color: '#06345d'
    }).setOrigin(0, 0.5);
    this.fullscreenButtons = [
      this.createToggleButton(640, 342, 'SI', 'Sí'),
      this.createToggleButton(735, 342, 'NO', 'No')
    ];
    this.updateToggleGroup(this.fullscreenButtons, this.scale.isFullscreen ? 'Sí' : 'No');
    this.fullscreenButtons.forEach((button) => {
      button.label.on('pointerdown', () => {
        AudioService.playSFX('click');
        if (button.value === 'Sí' && !this.scale.isFullscreen) {
          this.scale.startFullscreen();
        }
        if (button.value === 'No' && this.scale.isFullscreen) {
          this.scale.stopFullscreen();
        }
        this.updateToggleGroup(this.fullscreenButtons, button.value);
      });
    });

    this.add.text(284, 415, 'IDIOMA', {
      font: 'bold 30px "Outfit", "Inter", Arial, sans-serif',
      color: '#06345d'
    }).setOrigin(0, 0.5);
    this.languageButtons = [
      this.createToggleButton(610, 415, 'ESPAÑOL', 'Español', 150),
      this.createToggleButton(775, 415, 'INGLES', 'Inglés', 135)
    ];
    this.updateToggleGroup(this.languageButtons, this.language);
    this.languageButtons.forEach((button) => {
      button.label.on('pointerdown', () => {
        AudioService.playSFX('click');
        this.language = button.value;
        this.updateToggleGroup(this.languageButtons, button.value);
      });
    });

    this.add.text(width / 2, height - 38, 'Opciones simples para jugar comodo', {
      font: 'bold 24px "Outfit", "Inter", Arial, sans-serif',
      color: '#dff8ff',
      stroke: '#00304f',
      strokeThickness: 4
    }).setOrigin(0.5);
  }

  private createGearButton(x: number, y: number): void {
    const button = this.add.graphics();
    button.fillStyle(0x0aa6d8, 1);
    button.fillRoundedRect(x - 152, y - 30, 304, 60, 30);
    button.fillStyle(0x5defff, 0.9);
    button.fillRoundedRect(x - 140, y - 24, 280, 18, 12);
    button.lineStyle(5, 0x00649b, 1);
    button.strokeRoundedRect(x - 152, y - 30, 304, 60, 30);

    this.drawGear(x - 98, y);
    this.add.text(x + 22, y, 'AJUSTES', {
      font: 'bold 34px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#00557d',
      strokeThickness: 6
    }).setOrigin(0.5);
  }

  private drawGear(x: number, y: number): void {
    const gear = this.add.graphics();
    gear.fillStyle(0xffffff, 1);
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      gear.fillCircle(x + Math.cos(angle) * 17, y + Math.sin(angle) * 17, 5);
    }
    gear.fillCircle(x, y, 17);
    gear.fillStyle(0x0aa6d8, 1);
    gear.fillCircle(x, y, 7);
  }

  private createSlider(
    title: string,
    labelX: number,
    y: number,
    initialValue: number,
    onChange: (value: number) => void,
    isMusic: boolean
  ): void {
    this.add.text(labelX, y, title, {
      font: 'bold 30px "Outfit", "Inter", Arial, sans-serif',
      color: '#06345d'
    }).setOrigin(0, 0.5);

    const bar = this.add.graphics();
    if (isMusic) {
      this.musicBar = bar;
    } else {
      this.sfxBar = bar;
    }
    this.drawSlider(bar, 420, y, initialValue);

    const zone = this.add.zone(570, y, 330, 44).setInteractive({ useHandCursor: true });
    this.input.setDraggable(zone);
    const update = (pointer: Phaser.Input.Pointer) => {
      const value = Phaser.Math.Clamp((pointer.x - 420) / 300, 0, 1);
      onChange(value);
    };
    zone.on('pointerdown', update);
    zone.on('drag', update);
  }

  private drawSlider(graphics: Phaser.GameObjects.Graphics, x: number, y: number, value: number): void {
    graphics.clear();
    graphics.fillStyle(0x8ecae6, 1);
    graphics.fillRoundedRect(x, y - 9, 300, 18, 9);
    graphics.fillStyle(0x00b4d8, 1);
    graphics.fillRoundedRect(x, y - 9, 300 * value, 18, 9);
    graphics.lineStyle(3, 0x00649b, 1);
    graphics.strokeRoundedRect(x, y - 9, 300, 18, 9);
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(x + 300 * value, y, 16);
    graphics.lineStyle(3, 0x00649b, 1);
    graphics.strokeCircle(x + 300 * value, y, 16);
  }

  private createToggleButton(x: number, y: number, label: string, value: string, width = 78): ToggleButton {
    const bg = this.add.graphics();
    const text = this.add.text(x, y, label, {
      font: 'bold 23px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      padding: { x: 12, y: 8 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    return { label: text, bg, value };
  }

  private updateToggleGroup(buttons: ToggleButton[], selected: string): void {
    buttons.forEach((button) => {
      const bounds = button.label.getBounds();
      const width = Math.max(bounds.width + 24, 72);
      button.bg.clear();
      button.bg.fillStyle(button.value === selected ? 0x00b4d8 : 0x6d9fbd, 1);
      button.bg.fillRoundedRect(button.label.x - width / 2, button.label.y - 22, width, 44, 20);
      button.bg.lineStyle(3, button.value === selected ? 0xffffff : 0x00649b, 1);
      button.bg.strokeRoundedRect(button.label.x - width / 2, button.label.y - 22, width, 44, 20);
    });
  }

  private createBackButton(): void {
    const width = this.cameras.main.width;
    const back = this.add.text(width / 2, 532, 'VOLVER', {
      font: 'bold 28px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      backgroundColor: '#008ec4',
      padding: { x: 24, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    back.on('pointerover', () => back.setScale(1.05));
    back.on('pointerout', () => back.setScale(1));
    back.on('pointerdown', () => {
      AudioService.playSFX('click');
      this.scene.start('PugGuideScene');
    });
  }
}
