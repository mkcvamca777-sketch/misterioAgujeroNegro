import Phaser from 'phaser';
import { AudioService } from '../audio/AudioService';
import { StorageService } from '../utils/StorageService';
import { createPugSubmarine } from '../utils/PugOceanArt';

type HiddenCreature = {
  x: number;
  y: number;
  name: string;
  color: number;
  fact: string;
};

export class PugLevel2Scene extends Phaser.Scene {
  private flashlight!: Phaser.GameObjects.Graphics;
  private energyBar!: Phaser.GameObjects.Graphics;
  private guideText?: Phaser.GameObjects.Text;
  private energy = 100;
  private found = 0;
  private readonly maxFound = 4;
  private readonly creatures: HiddenCreature[] = [
    {
      x: 250,
      y: 250,
      name: 'Pez linterna',
      color: 0x6ee7ff,
      fact: '¡Encontrado! Algunos animales tienen ojos grandes para aprovechar la poca luz.'
    },
    {
      x: 500,
      y: 355,
      name: 'Medusa oscura',
      color: 0xb388ff,
      fact: '¡Encontrado! En esta zona muchos cuerpos son transparentes o muy oscuros.'
    },
    {
      x: 785,
      y: 270,
      name: 'Calamar joven',
      color: 0xff8fab,
      fact: '¡Encontrado! Algunas criaturas suben y bajan buscando alimento.'
    },
    {
      x: 1030,
      y: 395,
      name: 'Pez plateado',
      color: 0xd9f7ff,
      fact: '¡Encontrado! Los reflejos ayudan a esconderse en la poca luz.'
    },
    {
      x: 640,
      y: 470,
      name: 'Sombra marina',
      color: 0x9ad5ca,
      fact: '¡Encontrado! Las siluetas se confunden con rocas y agua oscura.'
    },
    {
      x: 1110,
      y: 220,
      name: 'Cria profunda',
      color: 0xffd166,
      fact: '¡Encontrado! La vida se adapta cuando la luz comienza a desaparecer.'
    }
  ];

  constructor() {
    super('PugLevel2Scene');
  }

  create(): void {
    this.cameras.main.fadeIn(400, 0, 0, 20);
    this.drawTwilightZone();
    this.createHeader();
    this.createSubmarine();
    this.createCreatures();
    this.createGuide('La luz esta bajando. Usa el reflector con el mouse para encontrar 4 criaturas.');
    this.createExitButton();
  }

  update(_time: number, delta: number): void {
    const pointer = this.input.activePointer;
    const spending = pointer.isDown && this.energy > 0;
    const radius = spending ? 132 : 58;

    this.energy = Phaser.Math.Clamp(this.energy + (spending ? -0.032 : 0.026) * delta, 0, 100);
    this.drawFlashlight(pointer.x, pointer.y, radius);
    this.drawEnergyBar();

    if (spending) {
      this.checkCreatureLight(pointer.x, pointer.y, radius);
    }
  }

  private drawTwilightZone(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0c5f91, 0x0b4c78, 0x041f3c, 0x020817, 1);
    bg.fillRect(0, 0, width, height);

    for (let i = 0; i < 8; i++) {
      const ray = this.add.graphics();
      ray.fillStyle(0x8fdfff, 0.05);
      ray.fillTriangle(80 + i * 170, 0, 180 + i * 170, 0, 40 + i * 140, height);
    }

    for (let i = 0; i < 16; i++) {
      const rock = this.add.graphics();
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(380, height);
      const size = Phaser.Math.Between(35, 88);
      rock.fillStyle(0x061526, 0.85);
      rock.fillTriangle(x - size, y + size, x, y - size, x + size, y + size);
    }

    const darkness = this.add.rectangle(width / 2, height / 2, width, height, 0x000a18, 0.42);
    darkness.setDepth(20);
    this.flashlight = this.add.graphics().setDepth(21);
  }

  private createHeader(): void {
    const width = this.cameras.main.width;

    this.add.text(width / 2, 30, 'NIVEL 2 - ZONA CREPUSCULAR', {
      font: 'bold 35px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#001a33',
      strokeThickness: 7
    }).setOrigin(0.5).setDepth(30);

    this.add.text(28, 28, 'Encuentra: 0 / 4', {
      font: 'bold 24px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#001a33',
      strokeThickness: 5
    }).setName('foundText').setDepth(30);

    this.energyBar = this.add.graphics().setDepth(30);
    this.drawEnergyBar();
  }

  private createSubmarine(): void {
    createPugSubmarine(this, 170, 145, 12, false);
  }

  private createCreatures(): void {
    this.creatures.forEach((creature) => {
      const creatureView = this.add.container(creature.x, creature.y).setDepth(11);
      const silhouette = this.add.graphics();
      silhouette.fillStyle(0x000713, 0.95);
      silhouette.fillEllipse(0, 0, 84, 40);
      silhouette.fillTriangle(38, 0, 72, -24, 72, 24);

      const animal = this.add.graphics();
      animal.fillStyle(creature.color, 1);
      animal.fillEllipse(0, 0, 84, 40);
      animal.fillTriangle(38, 0, 72, -24, 72, 24);
      animal.fillStyle(0xffffff, 1);
      animal.fillCircle(-24, -7, 5);
      animal.setVisible(false);

      const label = this.add.text(0, 42, creature.name, {
        font: 'bold 25px "Outfit", "Inter", Arial, sans-serif',
        color: '#ffffff',
        stroke: '#001a33',
        strokeThickness: 4
      }).setOrigin(0.5).setVisible(false);

      creatureView.setData('creature', creature);
      creatureView.setData('found', false);
      creatureView.setData('animal', animal);
      creatureView.setData('label', label);
      creatureView.add([silhouette, animal, label]);
    });
  }

  private drawFlashlight(x: number, y: number, radius: number): void {
    this.flashlight.clear();
    this.flashlight.fillStyle(0xf7fbff, 0.18);
    this.flashlight.fillCircle(x, y, radius + 42);
    this.flashlight.fillStyle(0xffffff, 0.34);
    this.flashlight.fillCircle(x, y, radius);
    this.flashlight.lineStyle(3, 0xbbeeff, 0.75);
    this.flashlight.strokeCircle(x, y, radius);
  }

  private checkCreatureLight(x: number, y: number, radius: number): void {
    this.children.list.forEach((item) => {
      if (!(item instanceof Phaser.GameObjects.Container) || !item.getData('creature') || item.getData('found')) {
        return;
      }

      const distance = Phaser.Math.Distance.Between(x, y, item.x, item.y);
      if (distance > radius * 0.68) return;

      item.setData('found', true);
      const animal = item.getData('animal') as Phaser.GameObjects.Graphics;
      const label = item.getData('label') as Phaser.GameObjects.Text;
      const creature = item.getData('creature') as HiddenCreature;
      animal.setVisible(true);
      label.setVisible(true);
      this.found++;
      this.updateFoundText();
      AudioService.playSFX('correct');
      this.createGuide(creature.fact);

      if (this.found >= this.maxFound) {
        this.time.delayedCall(900, () => this.completeLevel());
      }
    });
  }

  private updateFoundText(): void {
    const foundText = this.children.getByName('foundText') as Phaser.GameObjects.Text | null;
    foundText?.setText(`Encuentra: ${this.found} / ${this.maxFound}`);
  }

  private drawEnergyBar(): void {
    const width = this.cameras.main.width;
    this.energyBar.clear();
    this.energyBar.fillStyle(0x001a33, 0.78);
    this.energyBar.fillRoundedRect(width - 250, 20, 210, 24, 10);
    this.energyBar.fillStyle(this.energy > 20 ? 0x6ee7ff : 0xffd166, 1);
    this.energyBar.fillRoundedRect(width - 246, 24, 202 * (this.energy / 100), 16, 8);
    this.energyBar.lineStyle(2, 0xffffff, 0.65);
    this.energyBar.strokeRoundedRect(width - 250, 20, 210, 24, 10);
  }

  private createGuide(message: string): void {
    const height = this.cameras.main.height;
    const guide = this.add.image(88, height - 84, 'pug_guide').setDepth(40);
    guide.setDisplaySize(118, 118);

    if (this.guideText) {
      this.guideText.destroy();
    }

    this.guideText = this.add.text(172, height - 96, message, {
      font: 'bold 28px "Outfit", "Inter", Arial, sans-serif',
      color: '#08324d',
      wordWrap: { width: 820 },
      backgroundColor: 'rgba(235, 250, 255, 0.94)',
      padding: { x: 16, y: 12 }
    }).setDepth(40);
  }

  private completeLevel(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const isNewBadge = StorageService.unlockBadge('pug_crepuscular');

    const glow = this.add.graphics().setDepth(31);
    glow.fillStyle(0x7df9ff, 0.95);
    glow.fillCircle(width / 2 + 250, height / 2 + 85, 14);
    glow.fillStyle(0x7df9ff, 0.25);
    glow.fillCircle(width / 2 + 250, height / 2 + 85, 48);

    this.createGuide('Espera... ¿esa criatura esta produciendo su propia luz?');

    this.time.delayedCall(1500, () => {
      const panel = this.add.container(0, 0).setDepth(60);
      const shade = this.add.rectangle(width / 2, height / 2, width, height, 0x000a18, 0.55);
      const box = this.add.graphics();
      box.fillStyle(0xe9fbff, 0.97);
      box.fillRoundedRect(width / 2 - 300, height / 2 - 95, 600, 190, 18);
      box.lineStyle(5, 0x2ec4ff, 1);
      box.strokeRoundedRect(width / 2 - 300, height / 2 - 95, 600, 190, 18);
      const title = this.add.text(width / 2, height / 2 - 45, 'NIVEL 2 COMPLETADO ✓', {
        font: 'bold 40px "Outfit", "Inter", Arial, sans-serif',
        color: '#005f99'
      }).setOrigin(0.5);
      const desc = this.add.text(width / 2, height / 2 + 2, isNewBadge ? '¡NUEVA INSIGNIA DESBLOQUEADA!' : 'Insignia ya desbloqueada', {
        font: 'bold 28px "Outfit", "Inter", Arial, sans-serif',
        color: '#003f66'
      }).setOrigin(0.5);
      const next = this.add.text(width / 2, height / 2 + 52, 'SIGUIENTE NIVEL', {
        font: 'bold 24px "Outfit", "Inter", Arial, sans-serif',
        color: '#ffffff',
        backgroundColor: '#008ec4',
        padding: { x: 18, y: 10 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      next.on('pointerdown', () => {
        AudioService.playSFX('click');
        this.scene.start('PugLevel3Scene');
      });

      panel.add([shade, box, title, desc, next]);
    });
  }

  private createExitButton(): void {
    const width = this.cameras.main.width;
    const exit = this.add.text(width - 24, 62, 'SALIR', {
      font: 'bold 24px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#001a33',
      strokeThickness: 5
    }).setOrigin(1, 0.5).setDepth(30).setInteractive({ useHandCursor: true });

    exit.on('pointerdown', () => {
      AudioService.playSFX('click');
      this.scene.start('PugGuideScene');
    });
  }
}
