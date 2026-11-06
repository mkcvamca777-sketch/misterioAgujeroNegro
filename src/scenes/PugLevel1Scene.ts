import Phaser from 'phaser';
import { AudioService } from '../audio/AudioService';
import { StorageService } from '../utils/StorageService';
import { createPugSubmarine } from '../utils/PugOceanArt';

type BubbleInfo = {
  x: number;
  y: number;
  text: string;
};

type AnimalOption = {
  name: string;
  correct: boolean;
  color: number;
};

export class PugLevel1Scene extends Phaser.Scene {
  private submarine!: Phaser.GameObjects.Container;
  private depthText!: Phaser.GameObjects.Text;
  private guideText!: Phaser.GameObjects.Text;
  private selectedAnimals = 0;
  private miniGameStarted = false;
  private canControlSubmarine = true;
  private unlockedLevelBadge = false;
  private submarineTargetX = 210;
  private submarineTargetY = 165;

  private readonly bubbleInfos: BubbleInfo[] = [
    {
      x: 300,
      y: 220,
      text: 'La Zona de Luz llega aproximadamente hasta los 200 metros de profundidad.'
    },
    {
      x: 650,
      y: 260,
      text: 'Aqui ocurre gran parte de la fotosintesis del oceano gracias a la luz solar.'
    },
    {
      x: 980,
      y: 315,
      text: 'Al descender, algunos colores de la luz desaparecen antes que otros.'
    }
  ];

  private readonly animals: AnimalOption[] = [
    { name: 'Tortuga marina', correct: true, color: 0x3ddc84 },
    { name: 'Delfin', correct: true, color: 0x66d9ff },
    { name: 'Pez de superficie', correct: true, color: 0xffd166 },
    { name: 'Pez abisal', correct: false, color: 0x9b5de5 },
    { name: 'Calamar profundo', correct: false, color: 0xf15bb5 },
    { name: 'Pez gran profundidad', correct: false, color: 0x577590 }
  ];

  constructor() {
    super('PugLevel1Scene');
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.cameras.main.fadeIn(400, 0, 30, 70);
    this.drawOceanBackground();
    this.createHeader();
    this.createSubmarine();
    this.createExitButton();
    this.input.on('pointermove', this.updateSubmarineTarget, this);
    this.input.on('pointerdown', this.updateSubmarineTarget, this);
    this.showGuideMessage('¡Comienza nuestra expedicion! Vamos a descubrir que se esconde bajo la superficie.');

    this.time.delayedCall(1200, () => this.createInfoBubbles());
  }

  private drawOceanBackground(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x8ed8ff, 0x8ed8ff, 0x035f9d, 0x00325e, 1);
    bg.fillRect(0, 0, width, height);

    for (let i = 0; i < 6; i++) {
      const ray = this.add.graphics();
      ray.fillStyle(0xffffff, 0.12);
      ray.fillTriangle(130 + i * 185, 0, 240 + i * 185, 0, 90 + i * 135, height);
      this.tweens.add({
        targets: ray,
        alpha: 0.35,
        duration: 1800 + i * 250,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    for (let i = 0; i < 42; i++) {
      const bubble = this.add.circle(
        Phaser.Math.Between(20, width - 20),
        Phaser.Math.Between(80, height + 80),
        Phaser.Math.FloatBetween(2, 7),
        0xd8f7ff,
        0.35
      );
      this.tweens.add({
        targets: bubble,
        y: -30,
        duration: Phaser.Math.Between(7000, 13000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 2500)
      });
    }
  }

  private createHeader(): void {
    const width = this.cameras.main.width;

    this.add.text(width / 2, 30, 'NIVEL 1 - ZONA DE LUZ', {
      font: 'bold 36px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#00477a',
      strokeThickness: 7
    }).setOrigin(0.5);

    this.depthText = this.add.text(28, 28, 'Profundidad: 0 m', {
      font: 'bold 24px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#00477a',
      strokeThickness: 5
    });

    this.tweens.addCounter({
      from: 0,
      to: 200,
      duration: 9000,
      onUpdate: (tween) => {
        this.depthText.setText(`Profundidad: ${Math.round(tween.getValue() ?? 0)} m`);
      }
    });
  }

  private createSubmarine(): void {
    this.submarine = createPugSubmarine(this, this.submarineTargetX, this.submarineTargetY, 8, true);
  }

  update(): void {
    if (!this.canControlSubmarine || !this.submarine) return;

    this.submarine.x = Phaser.Math.Linear(this.submarine.x, this.submarineTargetX, 0.06);
    this.submarine.y = Phaser.Math.Linear(this.submarine.y, this.submarineTargetY, 0.06);
    this.submarine.rotation = Phaser.Math.Clamp((this.submarineTargetY - this.submarine.y) * 0.003, -0.12, 0.12);
  }

  private updateSubmarineTarget(pointer: Phaser.Input.Pointer): void {
    this.submarineTargetX = Phaser.Math.Clamp(pointer.x, 120, this.cameras.main.width - 120);
    this.submarineTargetY = Phaser.Math.Clamp(pointer.y, 135, this.cameras.main.height - 90);
  }

  private createInfoBubbles(): void {
    this.bubbleInfos.forEach((info, index) => {
      const bubble = this.add.container(info.x, info.y);
      const circle = this.add.circle(0, 0, 38, 0xcff8ff, 0.62);
      circle.setStrokeStyle(4, 0xffffff, 0.9);
      const label = this.add.text(0, 0, `${index + 1}`, {
        font: 'bold 34px "Outfit", "Inter", Arial, sans-serif',
        color: '#005f99'
      }).setOrigin(0.5);
      bubble.add([circle, label]);
      bubble.setSize(76, 76);
      bubble.setInteractive({ useHandCursor: true });

      this.tweens.add({
        targets: bubble,
        y: info.y - 12,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      bubble.on('pointerdown', () => {
        AudioService.playSFX('correct');
        this.showInfoCard(info.text, () => {
          bubble.destroy();
          if (!this.miniGameStarted && this.children.list.filter((item) => item.name === 'infoBubble').length === 0) {
            this.startAnimalMiniGame();
          }
        });
      });

      bubble.name = 'infoBubble';
    });
  }

  private showGuideMessage(message: string): void {
    if (this.guideText) {
      this.guideText.destroy();
    }

    const width = this.cameras.main.width;
    this.guideText = this.add.text(width / 2, 92, message, {
      font: 'bold 30px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 980 },
      backgroundColor: 'rgba(0, 68, 110, 0.55)',
      padding: { x: 16, y: 10 }
    }).setOrigin(0.5);
  }

  private showInfoCard(message: string, onClose: () => void): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const panel = this.add.container(0, 0).setDepth(50);

    const shade = this.add.rectangle(width / 2, height / 2, width, height, 0x00284d, 0.35);
    const box = this.add.graphics();
    box.fillStyle(0xe9fbff, 0.96);
    box.fillRoundedRect(width / 2 - 330, height / 2 - 95, 660, 190, 16);
    box.lineStyle(4, 0x0096c7, 1);
    box.strokeRoundedRect(width / 2 - 330, height / 2 - 95, 660, 190, 16);

    const text = this.add.text(width / 2, height / 2 - 20, message, {
      font: 'bold 34px "Outfit", "Inter", Arial, sans-serif',
      color: '#004b73',
      align: 'center',
      wordWrap: { width: 600 }
    }).setOrigin(0.5);

    const ok = this.add.text(width / 2, height / 2 + 58, 'CONTINUAR', {
      font: 'bold 24px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      backgroundColor: '#008ec4',
      padding: { x: 18, y: 9 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    ok.on('pointerdown', () => {
      AudioService.playSFX('click');
      panel.destroy();
      onClose();
    });

    panel.add([shade, box, text, ok]);
  }

  private startAnimalMiniGame(): void {
    this.miniGameStarted = true;
    this.showGuideMessage('Minijuego: ¿Quien vive aqui? Selecciona los 3 animales de la Zona de Luz.');

    this.tweens.add({
      targets: this.submarine,
      y: 470,
      duration: 1400,
      ease: 'Sine.easeInOut'
    });

    this.animals.forEach((animal, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      this.createAnimalCard(250 + col * 390, 190 + row * 135, animal);
    });
  }

  private createAnimalCard(x: number, y: number, animal: AnimalOption): void {
    const card = this.add.container(x, y).setDepth(10);
    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.92);
    bg.fillRoundedRect(-145, -45, 290, 90, 14);
    bg.lineStyle(4, 0x0a8dc4, 1);
    bg.strokeRoundedRect(-145, -45, 290, 90, 14);

    const animalIcon = this.add.graphics();
    animalIcon.fillStyle(animal.color, 1);
    animalIcon.fillEllipse(-95, 0, 62, 34);
    animalIcon.fillTriangle(-62, 0, -34, -20, -34, 20);
    animalIcon.fillStyle(0xffffff, 1);
    animalIcon.fillCircle(-112, -6, 4);

    const label = this.add.text(-42, 0, animal.name, {
      font: 'bold 26px "Outfit", "Inter", Arial, sans-serif',
      color: '#003f66',
      wordWrap: { width: 170 }
    }).setOrigin(0, 0.5);

    card.add([bg, animalIcon, label]);
    card.setSize(290, 90);
    card.setInteractive({ useHandCursor: true });

    card.on('pointerdown', () => {
      if (!card.active) return;

      if (animal.correct) {
        AudioService.playSFX('correct');
        this.selectedAnimals++;
        this.showFloatingFeedback(x, y - 55, '✓ ¡Correcto!', '#00a86b');
        card.disableInteractive();
        card.setAlpha(0.45);

        if (this.selectedAnimals === 3) {
          this.time.delayedCall(650, () => this.completeLevel());
        }
      } else {
        AudioService.playSFX('incorrect');
        this.showFloatingFeedback(x, y - 55, '✕ Este animal vive a mayor profundidad.', '#d62828');
      }
    });
  }

  private showFloatingFeedback(x: number, y: number, message: string, color: string): void {
    const text = this.add.text(x, y, message, {
      font: 'bold 28px "Outfit", "Inter", Arial, sans-serif',
      color,
      stroke: '#ffffff',
      strokeThickness: 4,
      align: 'center',
      wordWrap: { width: 430 }
    }).setOrigin(0.5).setDepth(60);

    this.tweens.add({
      targets: text,
      y: y - 28,
      alpha: 0,
      duration: 1200,
      ease: 'Sine.easeIn',
      onComplete: () => text.destroy()
    });
  }

  private completeLevel(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    this.unlockedLevelBadge = StorageService.unlockBadge('pug_luz');

    this.showGuideMessage('Cada vez llega menos luz... estamos entrando en una nueva zona.');
    this.canControlSubmarine = false;

    const darkLayer = this.add.rectangle(width / 2, height / 2, width, height, 0x001d3d, 0).setDepth(45);
    this.tweens.add({
      targets: darkLayer,
      alpha: 0.35,
      duration: 1400
    });

    this.tweens.add({
      targets: this.submarine,
      y: height + 80,
      duration: 1800,
      ease: 'Sine.easeIn'
    });

    this.time.delayedCall(1500, () => {
      this.showCompletionPanel();
    });
  }

  private showCompletionPanel(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const panel = this.add.container(0, 0).setDepth(80);

    const shade = this.add.rectangle(width / 2, height / 2, width, height, 0x00101f, 0.55);
    const box = this.add.graphics();
    box.fillStyle(0xe9fbff, 0.97);
    box.fillRoundedRect(width / 2 - 310, height / 2 - 120, 620, 240, 18);
    box.lineStyle(5, 0x0077b6, 1);
    box.strokeRoundedRect(width / 2 - 310, height / 2 - 120, 620, 240, 18);

    const title = this.add.text(width / 2, height / 2 - 58, 'NIVEL 1 COMPLETADO', {
      font: 'bold 40px "Outfit", "Inter", Arial, sans-serif',
      color: '#005f99'
    }).setOrigin(0.5);

    const desc = this.add.text(width / 2, height / 2 + 2, `${this.unlockedLevelBadge ? '¡NUEVA INSIGNIA DESBLOQUEADA!\n' : ''}¡Excelente! Ya conoces algunos habitantes de la Zona de Luz.\nSiguiente: Nivel 2 - Zona Crepuscular`, {
      font: 'bold 28px "Outfit", "Inter", Arial, sans-serif',
      color: '#003f66',
      align: 'center',
      wordWrap: { width: 540 }
    }).setOrigin(0.5);

    const next = this.add.text(width / 2, height / 2 + 82, 'SIGUIENTE NIVEL', {
      font: 'bold 24px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      backgroundColor: '#008ec4',
      padding: { x: 18, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    next.on('pointerdown', () => {
      AudioService.playSFX('click');
      this.scene.start('PugLevel2Scene');
    });

    panel.add([shade, box, title, desc, next]);
  }

  private createExitButton(): void {
    const width = this.cameras.main.width;
    const exit = this.add.text(width - 24, 28, 'SALIR', {
      font: 'bold 24px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#00477a',
      strokeThickness: 5
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

    exit.on('pointerdown', () => {
      AudioService.playSFX('click');
      this.scene.start('PugGuideScene');
    });
  }
}
