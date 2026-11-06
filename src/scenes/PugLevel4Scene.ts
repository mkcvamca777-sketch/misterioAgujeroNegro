import Phaser from 'phaser';
import { AudioService } from '../audio/AudioService';
import { StorageService } from '../utils/StorageService';
import { createPugSubmarine } from '../utils/PugOceanArt';

type QuizQuestion = {
  text: string;
  options: string[];
  correct: number;
  explanation: string;
};

export class PugLevel4Scene extends Phaser.Scene {
  private submarine!: Phaser.GameObjects.Container;
  private heartsText!: Phaser.GameObjects.Text;
  private depthText!: Phaser.GameObjects.Text;
  private guideText?: Phaser.GameObjects.Text;
  private obstacles: Phaser.GameObjects.Container[] = [];
  private lives = 3;
  private depth = 4000;
  private progress = 0;
  private pausedForQuestion = false;
  private gameEnded = false;
  private nextQuestionAt = 28;
  private currentQuestion = 0;
  private currentPush = 0;

  private readonly questions: QuizQuestion[] = [
    {
      text: '¿Que aumenta mientras descendemos en el oceano?',
      options: ['A) La luz', 'B) La presion', 'C) La temperatura'],
      correct: 1,
      explanation: 'Correcto: mientras mas profundo bajamos, mayor es la presion del agua.'
    },
    {
      text: '¿Donde esta aproximadamente la Zona Abisal?',
      options: ['A) 0 a 200 m', 'B) 200 a 1.000 m', 'C) 4.000 a 6.000 m'],
      correct: 2,
      explanation: 'La Zona Abisal se encuentra aproximadamente entre los 4.000 y 6.000 metros.'
    },
    {
      text: '¿Hay luz solar en la Zona Abisal?',
      options: ['A) Si, mucha', 'B) No existe luz solar', 'C) Solo al mediodia'],
      correct: 1,
      explanation: 'En la Zona Abisal no llega la luz solar.'
    }
  ];

  constructor() {
    super('PugLevel4Scene');
  }

  create(): void {
    this.lives = 3;
    this.depth = 4000;
    this.progress = 0;
    this.pausedForQuestion = false;
    this.gameEnded = false;
    this.nextQuestionAt = 28;
    this.currentQuestion = 0;
    this.currentPush = 0;
    this.obstacles = [];

    this.cameras.main.fadeIn(450, 0, 0, 0);
    this.drawAbyss();
    this.createHeader();
    this.submarine = createPugSubmarine(this, this.cameras.main.width / 2, 130, 16, true);
    this.createGuide('Estamos entrando en la Zona Abisal. Desde aqui, cada decision importa.');
    this.createExitButton();

    this.time.addEvent({
      delay: 760,
      loop: true,
      callback: () => {
        if (!this.pausedForQuestion && !this.gameEnded) this.spawnObstacle();
      }
    });

    this.time.addEvent({
      delay: 3600,
      loop: true,
      callback: () => {
        if (!this.pausedForQuestion && !this.gameEnded) this.startCurrent();
      }
    });
  }

  update(_time: number, delta: number): void {
    if (this.gameEnded || this.pausedForQuestion) return;

    const pointer = this.input.activePointer;
    const targetX = Phaser.Math.Clamp(pointer.x + this.currentPush, 125, this.cameras.main.width - 125);
    this.submarine.x = Phaser.Math.Linear(this.submarine.x, targetX, 0.075);
    this.submarine.y = 130 + Math.sin(this.progress / 9) * 10;

    this.progress += delta * 0.014;
    this.depth += delta * 0.018;
    this.depthText.setText(`Profundidad: ${Math.round(this.depth)} m`);

    this.updateObstacles(delta);

    if (this.currentQuestion < this.questions.length && this.progress >= this.nextQuestionAt) {
      this.showQuestion(this.questions[this.currentQuestion]);
    }

    if (this.progress >= 100) {
      this.completeLevel();
    }
  }

  private drawAbyss(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x041022, 0x020817, 0x000308, 0x000000, 1);
    bg.fillRect(0, 0, width, height);

    for (let i = 0; i < 35; i++) {
      this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(70, height),
        Phaser.Math.FloatBetween(1, 3),
        0x7df9ff,
        Phaser.Math.FloatBetween(0.04, 0.16)
      );
    }
  }

  private createHeader(): void {
    const width = this.cameras.main.width;
    this.add.text(width / 2, 30, 'NIVEL 4 - ZONA ABISAL', {
      font: 'bold 36px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000713',
      strokeThickness: 7
    }).setOrigin(0.5).setDepth(40);

    this.depthText = this.add.text(28, 28, 'Profundidad: 4000 m', {
      font: 'bold 24px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000713',
      strokeThickness: 5
    }).setDepth(40);

    this.heartsText = this.add.text(28, 58, '♥ ♥ ♥', {
      font: 'bold 36px Arial',
      color: '#ff4d6d',
      stroke: '#ffffff',
      strokeThickness: 3
    }).setDepth(40);
  }

  private spawnObstacle(): void {
    const width = this.cameras.main.width;
    const x = Phaser.Math.Between(80, width - 80);
    const kind = Phaser.Math.Between(0, 4);
    const item = this.add.container(x, this.cameras.main.height + 50).setDepth(14);
    const art = this.add.graphics();

    if (kind <= 1) {
      art.fillStyle(0x111827, 1);
      art.fillTriangle(-34, 28, -4, -36, 38, 28);
      art.fillTriangle(-56, 34, -28, -24, 4, 34);
      item.setData('damage', true);
      item.setData('type', 'roca');
    } else if (kind === 2) {
      art.fillStyle(0x8a2be2, 1);
      art.fillEllipse(0, 0, 72, 34);
      art.fillTriangle(31, 0, 60, -20, 60, 20);
      art.fillStyle(0xffffff, 1);
      art.fillCircle(-24, -6, 5);
      item.setData('damage', true);
      item.setData('type', 'criatura');
    } else if (kind === 3) {
      art.fillStyle(0xcff8ff, 0.62);
      art.fillCircle(0, 0, 28);
      art.lineStyle(4, 0xffffff, 0.8);
      art.strokeCircle(0, 0, 28);
      item.setData('bubble', true);
    } else {
      art.fillStyle(0x7df9ff, 0.18);
      art.fillRoundedRect(-78, -18, 156, 36, 18);
      art.lineStyle(4, 0x7df9ff, 0.55);
      art.lineBetween(-56, 0, 56, 0);
      item.setData('current', true);
    }

    item.add(art);
    item.setData('hit', false);
    this.obstacles.push(item);
  }

  private updateObstacles(delta: number): void {
    const speed = delta * 0.19;
    this.obstacles = this.obstacles.filter((item) => {
      item.y -= speed;

      if (!item.getData('hit') && Phaser.Math.Distance.Between(item.x, item.y, this.submarine.x, this.submarine.y) < 72) {
        item.setData('hit', true);
        if (item.getData('damage')) {
          this.takeDamage();
        } else if (item.getData('bubble')) {
          AudioService.playSFX('correct');
          this.createGuide(this.randomBubbleFact());
        } else if (item.getData('current')) {
          this.startCurrent();
        }
        item.destroy();
        return false;
      }

      if (item.y < -80) {
        item.destroy();
        return false;
      }
      return true;
    });
  }

  private startCurrent(): void {
    this.currentPush = Phaser.Math.Between(-120, 120);
    this.createGuide(this.currentPush > 0 ? '¡Corriente submarina! Empuja hacia la derecha.' : '¡Corriente submarina! Empuja hacia la izquierda.');
    this.time.delayedCall(1400, () => {
      this.currentPush = 0;
    });
  }

  private randomBubbleFact(): string {
    return Phaser.Utils.Array.GetRandom([
      'La Zona Abisal se encuentra aproximadamente entre los 4.000 y 6.000 metros.',
      'Aqui no existe luz solar.',
      'A pesar del frio, la oscuridad y la presion, existen organismos capaces de vivir aqui.'
    ]);
  }

  private takeDamage(): void {
    AudioService.playSFX('incorrect');
    this.lives--;
    this.heartsText.setText('♥ '.repeat(Math.max(this.lives, 0)).trim());
    this.cameras.main.flash(220, 255, 40, 70);

    if (this.lives <= 0) {
      this.showGameOver();
    }
  }

  private showQuestion(question: QuizQuestion): void {
    this.pausedForQuestion = true;
    this.currentQuestion++;
    this.nextQuestionAt += 28;

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const panel = this.add.container(0, 0).setDepth(70);
    const shade = this.add.rectangle(width / 2, height / 2, width, height, 0x000713, 0.65);
    const box = this.add.graphics();
    box.fillStyle(0xeafbff, 0.98);
    box.fillRoundedRect(width / 2 - 380, height / 2 - 170, 760, 340, 18);
    box.lineStyle(5, 0x7df9ff, 1);
    box.strokeRoundedRect(width / 2 - 380, height / 2 - 170, 760, 340, 18);
    panel.add([shade, box]);

    const title = this.add.text(width / 2, height / 2 - 112, question.text, {
      font: 'bold 36px "Outfit", "Inter", Arial, sans-serif',
      color: '#08324d',
      align: 'center',
      wordWrap: { width: 660 }
    }).setOrigin(0.5);
    panel.add(title);

    question.options.forEach((option, index) => {
      const optionText = this.add.text(width / 2, height / 2 - 35 + index * 58, option, {
        font: 'bold 28px "Outfit", "Inter", Arial, sans-serif',
        color: '#ffffff',
        backgroundColor: '#008ec4',
        padding: { x: 18, y: 9 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      optionText.on('pointerdown', () => this.answerQuestion(panel, question, index));
      panel.add(optionText);
    });
  }

  private answerQuestion(panel: Phaser.GameObjects.Container, question: QuizQuestion, answer: number): void {
    const correct = answer === question.correct;
    AudioService.playSFX(correct ? 'correct' : 'incorrect');
    panel.destroy();

    if (!correct) {
      this.takeDamage();
      this.createGuide(question.explanation);
      this.time.delayedCall(1300, () => {
        this.pausedForQuestion = false;
      });
      return;
    }

    this.createGuide(question.explanation);
    this.time.delayedCall(800, () => {
      this.pausedForQuestion = false;
    });
  }

  private showGameOver(): void {
    this.gameEnded = true;
    this.pausedForQuestion = true;
    this.obstacles.forEach((item) => item.destroy());
    this.obstacles = [];

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const bg = this.add.image(width / 2, height / 2, 'pug_game_over').setDepth(90);
    bg.setDisplaySize(width, height);

    const title = this.add.text(width / 2, height / 2 + 58, 'EXPEDICION FALLIDA\nEl submarino sufrio demasiados danos.', {
      font: 'bold 34px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 7,
      align: 'center'
    }).setOrigin(0.5).setDepth(91);

    const retry = this.add.text(width / 2 - 120, height - 62, 'REINTENTAR', {
      font: 'bold 28px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      backgroundColor: '#008ec4',
      padding: { x: 18, y: 10 }
    }).setOrigin(0.5).setDepth(91).setInteractive({ useHandCursor: true });

    const exit = this.add.text(width / 2 + 120, height - 62, 'SALIR', {
      font: 'bold 28px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      backgroundColor: '#d62828',
      padding: { x: 18, y: 10 }
    }).setOrigin(0.5).setDepth(91).setInteractive({ useHandCursor: true });

    retry.on('pointerdown', () => {
      AudioService.playSFX('click');
      this.scene.restart();
    });
    exit.on('pointerdown', () => {
      AudioService.playSFX('click');
      this.scene.start('PugGuideScene');
    });

    title.setName('gameOverText');
  }

  private completeLevel(): void {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.pausedForQuestion = true;
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const isNewBadge = StorageService.unlockBadge('pug_abisal');
    this.createGuide('¡Lo logramos! Pero todavia existe un lugar aun mas profundo...');

    const floor = this.add.graphics().setDepth(30);
    floor.fillStyle(0x030712, 1);
    floor.fillRoundedRect(0, height - 90, width, 150, 40);

    this.time.delayedCall(1200, () => {
      const panel = this.add.container(0, 0).setDepth(80);
      const shade = this.add.rectangle(width / 2, height / 2, width, height, 0x000713, 0.62);
      const box = this.add.graphics();
      box.fillStyle(0xeafbff, 0.98);
      box.fillRoundedRect(width / 2 - 330, height / 2 - 105, 660, 210, 18);
      box.lineStyle(5, 0x4361ee, 1);
      box.strokeRoundedRect(width / 2 - 330, height / 2 - 105, 660, 210, 18);
      const title = this.add.text(width / 2, height / 2 - 48, 'NIVEL 4 COMPLETADO', {
        font: 'bold 40px "Outfit", "Inter", Arial, sans-serif',
        color: '#005f99'
      }).setOrigin(0.5);
      const desc = this.add.text(width / 2, height / 2 + 4, `${isNewBadge ? '¡NUEVA INSIGNIA DESBLOQUEADA!\n' : ''}Sobreviviste al Abismo.`, {
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
        this.scene.start('PugLevel5Scene');
      });
      panel.add([shade, box, title, desc, next]);
    });
  }

  private createGuide(message: string): void {
    const height = this.cameras.main.height;
    const guide = this.add.image(88, height - 84, 'pug_guide').setDepth(45);
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
    }).setDepth(45);
  }

  private createExitButton(): void {
    const width = this.cameras.main.width;
    const exit = this.add.text(width - 24, 28, 'SALIR', {
      font: 'bold 24px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000713',
      strokeThickness: 5
    }).setOrigin(1, 0.5).setDepth(40).setInteractive({ useHandCursor: true });

    exit.on('pointerdown', () => {
      AudioService.playSFX('click');
      this.scene.start('PugGuideScene');
    });
  }
}
