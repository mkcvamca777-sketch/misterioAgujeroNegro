import Phaser from 'phaser';
import { AudioService } from '../audio/AudioService';
import { StorageService } from '../utils/StorageService';

interface Question {
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}

export class Level4Scene extends Phaser.Scene {
  private probe!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  private tunnelRings: Phaser.GameObjects.Ellipse[] = [];
  private wormholeCenter = { x: 512, y: 300 };
  private targetCenter = { x: 512, y: 300 };
  
  private timeSurvived = 0;
  private survivalTimer!: Phaser.Time.TimerEvent;
  private timeText!: Phaser.GameObjects.Text;
  private goalTime = 20;

  private activeQuestion: Question | null = null;
  private quizActive = false;
  private dialogPanel!: Phaser.GameObjects.Container;
  private currentQuestionIndex = 0;

  private quizQuestions: Question[] = [
    {
      text: '¿Qué es teóricamente un agujero de gusano?',
      options: [
        'A) Un atajo a través del espacio-tiempo.',
        'B) Un tipo especial de estrella fugaz.',
        'C) El centro absoluto del universo.'
      ],
      correct: 0,
      explanation: '¡Correcto! Según la Relatividad General de Einstein, es un puente de Einstein-Rosen que conecta dos puntos distantes del espacio-tiempo.'
    },
    {
      text: 'Si viajas cerca de la velocidad de la luz, ¿qué le ocurre al tiempo para ti en comparación con la Tierra?',
      options: [
        'A) El tiempo pasa más rápido.',
        'B) El tiempo pasa más lento.',
        'C) El tiempo se detiene por completo.'
      ],
      correct: 1,
      explanation: '¡Excelente! Esto se conoce como dilatación temporal. Para ti, el tiempo pasa más lento que para los observadores estacionarios.'
    }
  ];

  constructor() {
    super('Level4Scene');
  }

  create(): void {
    // Play deep hum for black hole
    AudioService.playBlackHoleHum();
    this.events.once('shutdown', () => {
      AudioService.stopBlackHoleHum();
    });

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.physics.world.setBounds(0, 0, width, height);

    // Deep purple background
    const bg = this.add.graphics();
    bg.fillStyle(0x130026, 1);
    bg.fillRect(0, 0, width, height);

    // Create Wormhole Tunnel Rings
    for (let i = 0; i < 15; i++) {
      const ring = this.add.ellipse(width / 2, height / 2, 10, 10);
      ring.setStrokeStyle(4, 0x00e5ff, 0.5);
      // Give them staggered scales to form a tunnel
      ring.scaleX = i * 1.5;
      ring.scaleY = i * 1.5;
      this.tunnelRings.push(ring);
    }

    // UI
    this.add.text(20, height - 40, 'Controles: Usa las flechas para mantener la sonda cerca del centro del túnel.', {
      font: '14px "Outfit", "Inter", sans-serif',
      color: '#b3e5fc'
    });

    this.timeText = this.add.text(20, 20, `Estabilización: ${this.goalTime}s`, {
      font: 'bold 24px "Outfit", "Inter", sans-serif',
      color: '#ffffff'
    });

    const exitBtn = this.add.text(width - 20, 20, '✖ SALIR', {
      font: 'bold 16px "Outfit", "Inter", sans-serif',
      color: '#ff5555',
      backgroundColor: '#220000',
      padding: { x: 10, y: 5 }
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    exitBtn.on('pointerover', () => exitBtn.setColor('#ffffff'));
    exitBtn.on('pointerout', () => exitBtn.setColor('#ff5555'));
    exitBtn.on('pointerdown', () => {
      AudioService.playSFX('click');
      this.cameras.main.fadeOut(400, 10, 5, 27);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('MainMenuScene');
      });
    });

    // Probe
    this.probe = this.physics.add.image(width / 2, height / 2, 'player_probe');
    this.probe.setCollideWorldBounds(true);
    this.probe.setDamping(true);
    this.probe.setDrag(0.9);
    this.probe.setMaxVelocity(400);

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      
      // Cheat code / Shortcut to pass the level instantly
      const pKey = this.input.keyboard.addKey('P');
      pKey.on('down', () => {
        if (!this.quizActive) {
          this.timeText.setText('¡Túnel saltado!');
          this.completeLevel();
        }
      });
    }

    // Timer
    this.survivalTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (!this.quizActive) {
          this.timeSurvived++;
          const remaining = this.goalTime - this.timeSurvived;
          if (remaining > 0) {
            this.timeText.setText(`Estabilización: ${remaining}s`);
            
            // Randomly shift target center every second
            this.targetCenter.x = (width / 2) + Phaser.Math.Between(-300, 300);
            this.targetCenter.y = (height / 2) + Phaser.Math.Between(-200, 200);

          } else {
            this.timeText.setText('¡Túnel atravesado!');
            this.startQuiz();
          }
        }
      }
    });

    this.createDialogPanel();
  }

  update(): void {
    if (this.quizActive) {
      this.probe.setVelocity(0);
      return;
    }

    // Move wormhole center smoothly towards target
    this.wormholeCenter.x += (this.targetCenter.x - this.wormholeCenter.x) * 0.02;
    this.wormholeCenter.y += (this.targetCenter.y - this.wormholeCenter.y) * 0.02;

    // Update rings for 3D illusion
    this.tunnelRings.forEach((ring, index) => {
      // Expand rings outward
      ring.scaleX += 0.05;
      ring.scaleY += 0.05;
      
      // Update color based on scale
      ring.setStrokeStyle(4 + ring.scaleX * 0.5, 0x00e5ff, Math.max(0, 1 - (ring.scaleX / 30)));

      // Position them based on depth and center
      // Inner rings are closer to the wormhole center, outer rings to the screen center
      const depthFactor = 1 - (ring.scaleX / 30); // 1 = deep, 0 = screen
      ring.x = 512 + (this.wormholeCenter.x - 512) * Math.max(0, depthFactor);
      ring.y = 288 + (this.wormholeCenter.y - 288) * Math.max(0, depthFactor);

      // If a ring gets too big, recycle it to the center
      if (ring.scaleX > 25) {
        ring.scaleX = 0.1;
        ring.scaleY = 0.1;
      }
    });

    // Player Input Handling
    if (this.cursors) {
      const speed = 400;
      let ax = 0;
      let ay = 0;
      
      if (this.cursors.left.isDown) ax -= speed;
      if (this.cursors.right.isDown) ax += speed;
      if (this.cursors.up.isDown) ay -= speed;
      if (this.cursors.down.isDown) ay += speed;

      this.probe.setAcceleration(ax, ay);
      
      // Rotate probe based on movement
      if (ax !== 0 || ay !== 0) {
        const targetAngle = Math.atan2(ay, ax) + Math.PI/2;
        // Simple instant rotation for arcade feel
        this.probe.setRotation(targetAngle);
      }
    }

    // Collision checking: If probe is too far from the wormhole center
    // The "safe zone" is relative to where the center is.
    const dx = this.probe.x - this.wormholeCenter.x;
    const dy = this.probe.y - this.wormholeCenter.y;
    const distanceToCenter = Math.sqrt(dx * dx + dy * dy);

    if (distanceToCenter > 200) {
      this.handleHitWall();
    }
  }

  private handleHitWall(): void {
    AudioService.playSFX('incorrect');
    this.cameras.main.flash(400, 255, 0, 0);
    this.resetLevel();
  }

  private resetLevel(): void {
    this.probe.setPosition(this.cameras.main.width / 2, this.cameras.main.height / 2);
    this.probe.setVelocity(0);
    this.probe.setAcceleration(0, 0);
    
    this.wormholeCenter = { x: 512, y: 300 };
    this.targetCenter = { x: 512, y: 300 };

    this.timeSurvived = 0;
    this.timeText.setText(`Estabilización: ${this.goalTime}s`);
    this.quizActive = false;
  }

  private createDialogPanel(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.dialogPanel = this.add.container(0, 0);
    this.dialogPanel.setVisible(false);
    this.dialogPanel.setDepth(100);

    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x000000, 0.8);
    backdrop.fillRect(0, 0, width, height);
    this.dialogPanel.add(backdrop);

    const modalBg = this.add.graphics();
    modalBg.fillStyle(0x130d2d, 0.95);
    modalBg.lineStyle(4, 0x00e5ff, 1);
    modalBg.fillRoundedRect(width / 2 - 350, height / 2 - 200, 700, 400, 15);
    modalBg.strokeRoundedRect(width / 2 - 350, height / 2 - 200, 700, 400, 15);
    this.dialogPanel.add(modalBg);
  }

  private startQuiz(): void {
    this.quizActive = true;
    this.probe.setVelocity(0);
    this.currentQuestionIndex = 0;
    this.showQuizQuestion(this.quizQuestions[this.currentQuestionIndex]);
  }

  private showQuizQuestion(q: Question): void {
    this.activeQuestion = q;

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    while (this.dialogPanel.list.length > 2) {
      this.dialogPanel.list[2].destroy();
    }

    const qText = this.add.text(width / 2, height / 2 - 160, q.text, {
      fontSize: '34px',
      fontFamily: 'Outfit, sans-serif',
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 660 }
    }).setOrigin(0.5);
    // Add subtle shadow to stand out more
    qText.setShadow(2, 2, '#000000', 4, true, true);
    this.dialogPanel.add(qText);

    q.options.forEach((opt, idx) => {
      const yPos = height / 2 - 40 + (idx * 60);

      const btnG = this.add.graphics();
      btnG.fillStyle(0x281c4e, 1);
      btnG.fillRoundedRect(width / 2 - 280, yPos - 22, 560, 44, 8);
      this.dialogPanel.add(btnG);

      const btnT = this.add.text(width / 2 - 260, yPos, opt, {
        font: '16px "Outfit", sans-serif',
        color: '#ffc107'
      }).setOrigin(0, 0.5);
      this.dialogPanel.add(btnT);

      const btnZone = this.add.zone(width / 2, yPos, 560, 44).setInteractive({ useHandCursor: true });
      this.dialogPanel.add(btnZone);

      btnZone.on('pointerover', () => {
        btnG.clear();
        btnG.fillStyle(0x3e2c7a, 1);
        btnG.fillRoundedRect(width / 2 - 280, yPos - 22, 560, 44, 8);
      });

      btnZone.on('pointerout', () => {
        btnG.clear();
        btnG.fillStyle(0x281c4e, 1);
        btnG.fillRoundedRect(width / 2 - 280, yPos - 22, 560, 44, 8);
      });

      btnZone.on('pointerdown', () => {
        this.selectAnswer(idx);
      });
    });

    this.dialogPanel.setVisible(true);
  }

  private selectAnswer(index: number): void {
    if (!this.activeQuestion) return;

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const isCorrect = index === this.activeQuestion.correct;

    AudioService.playSFX(isCorrect ? 'correct' : 'incorrect');

    while (this.dialogPanel.list.length > 2) {
      this.dialogPanel.list[2].destroy();
    }

    const feedbackText = this.add.text(width / 2, height / 2 - 60, isCorrect ? '¡RESPUESTA CORRECTA!' : 'RESPUESTA INCORRECTA', {
      font: 'bold 28px "Outfit", sans-serif',
      color: isCorrect ? '#00e676' : '#ff1744',
      align: 'center'
    }).setOrigin(0.5);
    this.dialogPanel.add(feedbackText);

    const explanationText = this.add.text(width / 2, height / 2 + 10, isCorrect ? this.activeQuestion.explanation : 'Incorrecto. La relatividad enseña que el agujero de gusano es un atajo espacio-temporal y que moverse a la velocidad de la luz ralentiza tu tiempo.', {
      font: '18px "Outfit", sans-serif',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 600 }
    }).setOrigin(0.5);
    this.dialogPanel.add(explanationText);

    const btnContinue = this.add.graphics();
    btnContinue.fillStyle(isCorrect ? 0x00e676 : 0xff1744, 1);
    btnContinue.fillRoundedRect(width / 2 - 100, height / 2 + 100, 200, 44, 8);
    this.dialogPanel.add(btnContinue);

    const btnText = this.add.text(width / 2, height / 2 + 122, isCorrect ? 'CONTINUAR' : 'REINTENTAR', {
      font: 'bold 16px "Outfit", sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5);
    this.dialogPanel.add(btnText);

    const continueZone = this.add.zone(width / 2, height / 2 + 122, 200, 44).setInteractive({ useHandCursor: true });
    this.dialogPanel.add(continueZone);

    continueZone.on('pointerdown', () => {
      AudioService.playSFX('click');
      this.dialogPanel.setVisible(false);

      if (!isCorrect) {
        this.resetLevel();
      } else {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.quizQuestions.length) {
          this.showQuizQuestion(this.quizQuestions[this.currentQuestionIndex]);
        } else {
          this.completeLevel();
        }
      }
    });
  }

  private completeLevel(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    while (this.dialogPanel.list.length > 2) {
      this.dialogPanel.list[2].destroy();
    }

    StorageService.setCurrentLevel(5); // Unlock next
    StorageService.unlockBadge('viajero'); // Time traveler badge
    AudioService.playSFX('achievement');

    // Final Certificate Image
    const certImg = this.add.image(width / 2, height / 2 - 20, 'certificado_nivel4');
    
    // Scale it to fit within the 700x400 modal
    const scale = Math.min(550 / certImg.width, 260 / certImg.height);
    certImg.setScale(scale);
    this.dialogPanel.add(certImg);

    const btnMenu = this.add.graphics();
    btnMenu.fillStyle(0x00e5ff, 1);
    btnMenu.fillRoundedRect(width / 2 - 120, height / 2 + 130, 240, 48, 8);
    this.dialogPanel.add(btnMenu);

    const btnText = this.add.text(width / 2, height / 2 + 154, 'VOLVER AL MENÚ', {
      font: 'bold 16px "Outfit", sans-serif',
      color: '#130d2d'
    }).setOrigin(0.5);
    this.dialogPanel.add(btnText);

    const menuZone = this.add.zone(width / 2, height / 2 + 154, 240, 48).setInteractive({ useHandCursor: true });
    this.dialogPanel.add(menuZone);

    menuZone.on('pointerdown', () => {
      AudioService.playSFX('click');
      this.dialogPanel.setVisible(false);
      this.cameras.main.fadeOut(400, 10, 5, 27);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('MainMenuScene');
      });
    });

    this.dialogPanel.setVisible(true);
  }
}
