import Phaser from 'phaser';
import { AudioService } from '../audio/AudioService';
import { StorageService } from '../utils/StorageService';
import { createPugSubmarine } from '../utils/PugOceanArt';

type MidnightBubble = {
  x: number;
  y: number;
  text: string;
};

type MidnightCreature = {
  x: number;
  y: number;
  name: string;
  color: number;
  glows: boolean;
};

export class PugLevel3Scene extends Phaser.Scene {
  private flashlight!: Phaser.GameObjects.Graphics;
  private energyBar!: Phaser.GameObjects.Graphics;
  private guideText?: Phaser.GameObjects.Text;
  private foundText!: Phaser.GameObjects.Text;
  private energy = 100;
  private found = 0;
  private bubblesRead = 0;
  private miniGameStarted = false;
  private readonly maxFound = 5;

  private readonly bubbles: MidnightBubble[] = [
    {
      x: 260,
      y: 205,
      text: 'La Zona de Medianoche puede extenderse aproximadamente desde los 1.000 hasta los 4.000 metros.'
    },
    {
      x: 620,
      y: 285,
      text: 'Aunque aqui no llega la luz solar, algunos animales pueden producir su propia luz.'
    },
    {
      x: 1000,
      y: 225,
      text: 'La presion a estas profundidades es muchisimo mayor que en la superficie.'
    }
  ];

  private readonly creatures: MidnightCreature[] = [
    { x: 220, y: 335, name: 'Rape abisal', color: 0x7df9ff, glows: true },
    { x: 430, y: 235, name: 'Calamar vampiro', color: 0xff5d8f, glows: false },
    { x: 660, y: 390, name: 'Medusa brillante', color: 0xb388ff, glows: true },
    { x: 850, y: 255, name: 'Pez dragon', color: 0xffd166, glows: true },
    { x: 1080, y: 390, name: 'Camaron profundo', color: 0x90e0ef, glows: false },
    { x: 1090, y: 185, name: 'Pez sombra', color: 0xadb5bd, glows: false }
  ];

  constructor() {
    super('PugLevel3Scene');
  }

  create(): void {
    this.cameras.main.fadeIn(450, 0, 0, 0);
    this.drawMidnightZone();
    this.createHeader();
    createPugSubmarine(this, 175, 142, 12, true);
    this.createGuide('Ya no llega la luz del Sol. A partir de aqui tendremos que explorar con nuestras propias luces.');
    this.createDataBubbles();
    this.createExitButton();
  }

  update(_time: number, delta: number): void {
    const pointer = this.input.activePointer;
    const spending = pointer.isDown && this.energy > 0;
    const radius = spending ? 118 : 46;

    this.energy = Phaser.Math.Clamp(this.energy + (spending ? -0.034 : 0.028) * delta, 0, 100);
    this.drawFlashlight(pointer.x, pointer.y, radius);
    this.drawEnergyBar();

    if (this.miniGameStarted && spending) {
      this.checkCreatureLight(pointer.x, pointer.y, radius);
    }
  }

  private drawMidnightZone(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x07172d, 0x041022, 0x010611, 0x000207, 1);
    bg.fillRect(0, 0, width, height);

    for (let i = 0; i < 55; i++) {
      this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(90, height - 30),
        Phaser.Math.FloatBetween(1, 3.5),
        0x7df9ff,
        Phaser.Math.FloatBetween(0.05, 0.2)
      );
    }

    for (let i = 0; i < 9; i++) {
      const rock = this.add.graphics();
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(390, height);
      const size = Phaser.Math.Between(45, 100);
      rock.fillStyle(0x020817, 0.95);
      rock.fillTriangle(x - size, y + size, x - 12, y - size, x + size, y + size);
    }

    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.48).setDepth(20);
    this.flashlight = this.add.graphics().setDepth(21);
  }

  private createHeader(): void {
    const width = this.cameras.main.width;
    this.add.text(width / 2, 30, 'NIVEL 3 - ZONA DE MEDIANOCHE', {
      font: 'bold 35px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000713',
      strokeThickness: 7
    }).setOrigin(0.5).setDepth(30);

    this.add.text(28, 28, 'Profundidad: 1.000 m', {
      font: 'bold 24px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000713',
      strokeThickness: 5
    }).setDepth(30);

    this.foundText = this.add.text(28, 58, 'Criaturas: 0 / 5', {
      font: 'bold 24px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000713',
      strokeThickness: 5
    }).setDepth(30);

    this.energyBar = this.add.graphics().setDepth(30);
    this.drawEnergyBar();
  }

  private createDataBubbles(): void {
    this.bubbles.forEach((bubbleInfo, index) => {
      const bubble = this.add.container(bubbleInfo.x, bubbleInfo.y).setDepth(24);
      const orb = this.add.circle(0, 0, 36, 0x7df9ff, 0.34);
      orb.setStrokeStyle(4, 0xcff8ff, 0.82);
      const label = this.add.text(0, 0, `${index + 1}`, {
        font: 'bold 34px "Outfit", "Inter", Arial, sans-serif',
        color: '#ffffff',
        stroke: '#00364f',
        strokeThickness: 4
      }).setOrigin(0.5);

      bubble.add([orb, label]);
      bubble.setSize(72, 72);
      bubble.setInteractive({ useHandCursor: true });
      bubble.on('pointerdown', () => {
        AudioService.playSFX('correct');
        this.showInfoCard(bubbleInfo.text, () => {
          bubble.destroy();
          this.bubblesRead++;
          if (this.bubblesRead === this.bubbles.length) {
            this.startMiniGame();
          }
        });
      });
    });
  }

  private startMiniGame(): void {
    this.miniGameStarted = true;
    this.createGuide('Encuentra 5 animales de las profundidades. Algunos brillan un instante para ayudarte.');
    this.createCreatures();
  }

  private createCreatures(): void {
    this.creatures.forEach((creature, index) => {
      const creatureView = this.add.container(creature.x, creature.y).setDepth(11);
      const silhouette = this.add.graphics();
      silhouette.fillStyle(0x00030a, 0.98);
      silhouette.fillEllipse(0, 0, 94, 42);
      silhouette.fillTriangle(42, 0, 78, -24, 78, 24);

      const animal = this.add.graphics();
      animal.fillStyle(creature.color, 1);
      animal.fillEllipse(0, 0, 94, 42);
      animal.fillTriangle(42, 0, 78, -24, 78, 24);
      animal.fillStyle(0xffffff, 1);
      animal.fillCircle(-28, -8, 5);
      if (creature.glows) {
        animal.lineStyle(4, 0x7df9ff, 0.95);
        animal.strokeCircle(-12, -22, 13);
        animal.fillStyle(0x7df9ff, 1);
        animal.fillCircle(-12, -22, 5);
      }
      animal.setVisible(false);

      const label = this.add.text(0, 44, creature.name, {
        font: 'bold 25px "Outfit", "Inter", Arial, sans-serif',
        color: '#ffffff',
        stroke: '#000713',
        strokeThickness: 5
      }).setOrigin(0.5).setVisible(false);

      creatureView.setData('creature', creature);
      creatureView.setData('found', false);
      creatureView.setData('animal', animal);
      creatureView.setData('label', label);
      creatureView.add([silhouette, animal, label]);

      if (creature.glows) {
        this.time.addEvent({
          delay: 1700 + index * 260,
          loop: true,
          callback: () => {
            if (creatureView.getData('found')) return;
            animal.setVisible(true);
            this.tweens.add({
              targets: animal,
              alpha: 0.2,
              duration: 420,
              yoyo: true,
              onComplete: () => {
                animal.setAlpha(1);
                animal.setVisible(false);
              }
            });
          }
        });
      }
    });
  }

  private showInfoCard(message: string, onClose: () => void): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const panel = this.add.container(0, 0).setDepth(55);
    const shade = this.add.rectangle(width / 2, height / 2, width, height, 0x000713, 0.55);
    const box = this.add.graphics();
    box.fillStyle(0xe9fbff, 0.98);
    box.fillRoundedRect(width / 2 - 360, height / 2 - 105, 720, 210, 18);
    box.lineStyle(5, 0x7df9ff, 1);
    box.strokeRoundedRect(width / 2 - 360, height / 2 - 105, 720, 210, 18);

    const text = this.add.text(width / 2, height / 2 - 22, message, {
      font: 'bold 34px "Outfit", "Inter", Arial, sans-serif',
      color: '#08324d',
      align: 'center',
      wordWrap: { width: 640 },
      lineSpacing: 7
    }).setOrigin(0.5);

    const ok = this.add.text(width / 2, height / 2 + 68, 'CONTINUAR', {
      font: 'bold 24px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      backgroundColor: '#008ec4',
      padding: { x: 18, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    ok.on('pointerdown', () => {
      AudioService.playSFX('click');
      panel.destroy();
      onClose();
    });

    panel.add([shade, box, text, ok]);
  }

  private drawFlashlight(x: number, y: number, radius: number): void {
    this.flashlight.clear();
    this.flashlight.fillStyle(0x7df9ff, 0.12);
    this.flashlight.fillCircle(x, y, radius + 55);
    this.flashlight.fillStyle(0xffffff, 0.3);
    this.flashlight.fillCircle(x, y, radius);
    this.flashlight.lineStyle(3, 0xcff8ff, 0.8);
    this.flashlight.strokeCircle(x, y, radius);
  }

  private checkCreatureLight(x: number, y: number, radius: number): void {
    this.children.list.forEach((item) => {
      if (!(item instanceof Phaser.GameObjects.Container) || !item.getData('creature') || item.getData('found')) {
        return;
      }

      const distance = Phaser.Math.Distance.Between(x, y, item.x, item.y);
      if (distance > radius * 0.72) return;

      item.setData('found', true);
      const animal = item.getData('animal') as Phaser.GameObjects.Graphics;
      const label = item.getData('label') as Phaser.GameObjects.Text;
      animal.setVisible(true);
      label.setVisible(true);
      this.found++;
      this.foundText.setText(`Criaturas: ${this.found} / ${this.maxFound}`);
      AudioService.playSFX('correct');
      this.showFloatingFeedback(item.x, item.y - 55, '✓ ¡Criatura encontrada!');

      if (this.found >= this.maxFound) {
        this.time.delayedCall(850, () => this.completeLevel());
      }
    });
  }

  private showFloatingFeedback(x: number, y: number, message: string): void {
    const text = this.add.text(x, y, message, {
      font: 'bold 28px "Outfit", "Inter", Arial, sans-serif',
      color: '#7df9ff',
      stroke: '#000713',
      strokeThickness: 5
    }).setOrigin(0.5).setDepth(60);

    this.tweens.add({
      targets: text,
      y: y - 30,
      alpha: 0,
      duration: 1100,
      onComplete: () => text.destroy()
    });
  }

  private drawEnergyBar(): void {
    const width = this.cameras.main.width;
    this.energyBar.clear();
    this.energyBar.fillStyle(0x000713, 0.82);
    this.energyBar.fillRoundedRect(width - 250, 20, 210, 24, 10);
    this.energyBar.fillStyle(this.energy > 20 ? 0x7df9ff : 0xffd166, 1);
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

    this.guideText = this.add.text(172, height - 102, message, {
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
    const isNewBadge = StorageService.unlockBadge('pug_medianoche');
    this.createGuide('Pensabamos que esto era profundo... pero todavia podemos bajar mucho mas.');

    const seaFloor = this.add.graphics().setDepth(31);
    seaFloor.fillStyle(0x020617, 1);
    seaFloor.fillRoundedRect(0, height - 72, width, 120, 40);
    seaFloor.fillStyle(0x7df9ff, 0.18);
    seaFloor.fillCircle(width / 2 + 300, height - 105, 18);

    this.time.delayedCall(1400, () => {
      const panel = this.add.container(0, 0).setDepth(70);
      const shade = this.add.rectangle(width / 2, height / 2, width, height, 0x000713, 0.62);
      const box = this.add.graphics();
      box.fillStyle(0xe9fbff, 0.98);
      box.fillRoundedRect(width / 2 - 330, height / 2 - 105, 660, 210, 18);
      box.lineStyle(5, 0x7df9ff, 1);
      box.strokeRoundedRect(width / 2 - 330, height / 2 - 105, 660, 210, 18);

      const title = this.add.text(width / 2, height / 2 - 48, 'NIVEL 3 COMPLETADO', {
        font: 'bold 40px "Outfit", "Inter", Arial, sans-serif',
        color: '#005f99'
      }).setOrigin(0.5);

      const desc = this.add.text(width / 2, height / 2 + 4, `${isNewBadge ? '¡NUEVA INSIGNIA DESBLOQUEADA!\n' : ''}¡Excelente! Incluso en la oscuridad existe vida.`, {
        font: 'bold 28px "Outfit", "Inter", Arial, sans-serif',
        color: '#003f66',
        align: 'center'
      }).setOrigin(0.5);

      const next = this.add.text(width / 2, height / 2 + 72, 'SIGUIENTE NIVEL', {
        font: 'bold 24px "Outfit", "Inter", Arial, sans-serif',
        color: '#ffffff',
        backgroundColor: '#008ec4',
        padding: { x: 18, y: 10 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      next.on('pointerdown', () => {
        AudioService.playSFX('click');
        this.scene.start('PugLevel4Scene');
      });

      panel.add([shade, box, title, desc, next]);
    });
  }

  private createExitButton(): void {
    const width = this.cameras.main.width;
    const exit = this.add.text(width - 24, 62, 'SALIR', {
      font: 'bold 24px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000713',
      strokeThickness: 5
    }).setOrigin(1, 0.5).setDepth(30).setInteractive({ useHandCursor: true });

    exit.on('pointerdown', () => {
      AudioService.playSFX('click');
      this.scene.start('PugGuideScene');
    });
  }
}
