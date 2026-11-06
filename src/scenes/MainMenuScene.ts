import Phaser from 'phaser';
import { AudioService } from '../audio/AudioService';
import { StorageService } from '../utils/StorageService';

export class MainMenuScene extends Phaser.Scene {
  private buttons: Phaser.GameObjects.Sprite[] = [];
  private pibbleBlinkTimer!: Phaser.Time.TimerEvent;
  private versionsPanel?: Phaser.GameObjects.Container;
  private versionsButton?: Phaser.GameObjects.Sprite;

  constructor() {
    super('MainMenuScene');
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Fade in from black
    this.cameras.main.fadeIn(500, 10, 5, 27);

    // 1. Add background (Capa 1)
    const bg = this.add.image(width / 2, height / 2, 'menu_bg_new');
    bg.setOrigin(0.5, 0.5);
    bg.setDisplaySize(width, height);

    // 2. Add dynamic interactive animations on the background elements
    this.createBlackHoleAnimation();
    this.createLanternFlicker();
    this.createObservatoryGlow();

    // 3. Create Buttons (Capa 3)
    this.createCroppedButtons();
    this.createVersionsButton();

    // 4. Handle resize events to keep centering (responsive)
    this.scale.on('resize', this.resize, this);
  }

  private createBlackHoleAnimation(): void {
    // Ensure sparkle particle texture exists to prevent green wireframe placeholders
    if (!this.textures.exists('sparkle_particle')) {
      const g = this.make.graphics();
      g.fillStyle(0xffffff, 1);
      g.fillCircle(3, 3, 3);
      g.generateTexture('sparkle_particle', 6, 6);
    }

    // The black hole center is at X=833, Y=120
    const bhX = 833;
    const bhY = 120;

    const bhGlow = this.add.graphics();
    bhGlow.setPosition(bhX, bhY);
    
    // Draw a swirling gradient circle
    bhGlow.fillStyle(0xff7700, 0.15);
    bhGlow.fillCircle(0, 0, 70);
    bhGlow.fillStyle(0xcc00ff, 0.1);
    bhGlow.fillCircle(0, 0, 100);

    // Animate the glow pulsing
    this.tweens.add({
      targets: bhGlow,
      scaleX: 1.15,
      scaleY: 1.15,
      alpha: 0.7,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Swirling space particles going into the black hole
    const particles = this.add.particles(bhX, bhY, 'sparkle_particle', {
      lifespan: 2000,
      speed: { min: 20, max: 60 },
      scale: { start: 1.5, end: 0 },
      alpha: { start: 0.6, end: 0 },
      blendMode: 'ADD',
      frequency: 150,
      tint: [0xffaa00, 0xff00ff, 0x00ffff],
      emitZone: {
        type: 'random',
        source: new Phaser.Geom.Circle(0, 0, 120)
      }
    } as any);

    // Make particles gravitate towards center (suction effect)
    this.tweens.addCounter({
      from: 0,
      to: 360,
      duration: 10000,
      repeat: -1,
      onUpdate: (tween) => {
        particles.setAngle(tween.getValue() as number);
      }
    });
  }

  private createLanternFlicker(): void {
    // Lantern is located at X=879, Y=507
    const lanternGlow = this.add.circle(879, 507, 45, 0xffd700, 0.2);
    lanternGlow.setBlendMode(Phaser.BlendModes.ADD);

    // Flicker animation
    this.time.addEvent({
      delay: 50,
      loop: true,
      callback: () => {
        lanternGlow.setAlpha(Phaser.Math.FloatBetween(0.1, 0.35));
        lanternGlow.setRadius(Phaser.Math.FloatBetween(40, 50));
      }
    });
  }

  private createObservatoryGlow(): void {
    // Observatory window glow using smooth circle instead of polygon
    const windowGlow = this.add.circle(86, 355, 25, 0xffa500, 0.15);
    windowGlow.setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({
      targets: windowGlow,
      alpha: 0.35,
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: 'Quad.easeInOut'
    });
  }

  private createPibbleWandSparkles(): void {
    // Tip of Pibble's pointer stick is around X=280, Y=337
    const graphics = this.make.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(2, 2, 2);
    graphics.generateTexture('sparkle_particle', 4, 4);

    this.add.particles(280, 337, 'sparkle_particle', {
      lifespan: 800,
      speed: { min: 10, max: 40 },
      angle: { min: -60, max: -120 },
      gravityY: 50,
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: 'ADD',
      frequency: 250,
      tint: [0xfffa65, 0xffaf40, 0xff4ff8]
    } as any);
  }

  private createPibbleBlinking(): void {
    // Eyes are around Y=359 (Left X=173, Right X=201)
    const eyesCover = this.add.graphics();
    eyesCover.fillStyle(0xf7f1e3, 1);
    
    // Draw eyelid covers
    eyesCover.fillEllipse(173, 359, 12, 10);
    eyesCover.fillEllipse(201, 359, 12, 10);
    eyesCover.setVisible(false);

    // Periodic blinking timer
    this.pibbleBlinkTimer = this.time.addEvent({
      delay: Phaser.Math.Between(3000, 6000),
      loop: true,
      callback: () => {
        eyesCover.setVisible(true);
        this.time.delayedCall(150, () => {
          eyesCover.setVisible(false);
          this.pibbleBlinkTimer.reset({
            delay: Phaser.Math.Between(3000, 6000),
            loop: true,
            callback: this.pibbleBlinkTimer.callback
          });
        });
      }
    });
  }

  private createCroppedButtons(): void {
    const width = this.cameras.main.width;
    const btnData = [
      { key: 'btn_comenzar', scene: 'GameScene', crop: { x: 152, y: 232, w: 728, h: 188 } },
      { key: 'btn_enciclopedia', scene: 'EncyclopediaScene', crop: { x: 120, y: 244, w: 784, h: 192 } },
      { key: 'btn_insignias', scene: 'BadgesScene', crop: { x: 120, y: 244, w: 784, h: 192 } },
      { key: 'btn_configuracion', scene: 'ConfigScene', crop: { x: 120, y: 244, w: 792, h: 192 } },
      { key: 'btn_creditos', scene: 'CreditsScene', crop: { x: 124, y: 244, w: 784, h: 184 } }
    ];

    btnData.forEach((btn, index) => {
      const texture = this.textures.get(btn.key);
      if (texture && !texture.has('crop')) {
        texture.add('crop', 0, btn.crop.x, btn.crop.y, btn.crop.w, btn.crop.h);
      }

      // Vertical layout in a 1280x576 canvas
      const targetY = 370 + (index * 37);
      const btnSprite = this.add.sprite(width / 2, targetY, btn.key, 'crop');
      
      // Calculate uniform scale based on target width to preserve aspect ratio
      const targetWidth = 150;
      const baseScaleX = targetWidth / btnSprite.width;
      const baseScaleY = baseScaleX; // Uniform scaling
      btnSprite.setScale(baseScaleX, baseScaleY);
      
      btnSprite.setInteractive({ useHandCursor: true });
      this.buttons.push(btnSprite);

      // Hover and Click animations
      btnSprite.on('pointerover', () => {
        AudioService.playSFX('click');
        this.tweens.add({
          targets: btnSprite,
          scaleX: baseScaleX * 1.05,
          scaleY: baseScaleY * 1.05,
          duration: 120,
          ease: 'Back.easeOut'
        });
      });

      btnSprite.on('pointerout', () => {
        this.tweens.add({
          targets: btnSprite,
          scaleX: baseScaleX,
          scaleY: baseScaleY,
          duration: 120,
          ease: 'Sine.easeOut'
        });
      });

      btnSprite.on('pointerdown', () => {
        AudioService.playSFX('correct');

        this.tweens.add({
          targets: btnSprite,
          scaleX: baseScaleX * 0.95,
          scaleY: baseScaleY * 0.95,
          duration: 80,
          yoyo: true,
          onComplete: () => {
            this.cameras.main.fadeOut(400, 10, 5, 27);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
              const targetScene = btn.key === 'btn_comenzar' ? StorageService.getTargetScene() : btn.scene;
              this.scene.start(targetScene);
            });
          }
        });
      });
    });
  }

  private createVersionsButton(): void {
    const width = this.cameras.main.width;
    this.versionsButton = this.add.sprite(width / 2, 58, 'btn_versiones');
    const baseScale = 190 / this.versionsButton.width;
    this.versionsButton.setScale(baseScale);
    this.versionsButton.setInteractive({ useHandCursor: true });

    this.versionsButton.on('pointerover', () => {
      AudioService.playSFX('click');
      this.tweens.add({
        targets: this.versionsButton,
        scaleX: baseScale * 1.05,
        scaleY: baseScale * 1.05,
        duration: 120,
        ease: 'Back.easeOut'
      });
    });

    this.versionsButton.on('pointerout', () => {
      this.tweens.add({
        targets: this.versionsButton,
        scaleX: baseScale,
        scaleY: baseScale,
        duration: 120,
        ease: 'Sine.easeOut'
      });
    });

    this.versionsButton.on('pointerdown', () => {
      AudioService.playSFX('correct');
      this.toggleVersionsPanel();
    });
  }

  private toggleVersionsPanel(): void {
    if (this.versionsPanel) {
      this.tweens.add({
        targets: this.versionsPanel,
        alpha: 0,
        y: 94,
        duration: 160,
        ease: 'Sine.easeIn',
        onComplete: () => {
          this.versionsPanel?.destroy();
          this.versionsPanel = undefined;
        }
      });
      return;
    }

    const width = this.cameras.main.width;
    this.versionsPanel = this.add.container(width / 2, 94);
    this.versionsPanel.setAlpha(0);

    const panelBg = this.add.graphics();
    panelBg.fillStyle(0x071a6a, 0.86);
    panelBg.fillRoundedRect(-205, 0, 410, 188, 18);
    panelBg.lineStyle(4, 0x27e8ff, 0.95);
    panelBg.strokeRoundedRect(-205, 0, 410, 188, 18);
    panelBg.lineStyle(2, 0xffffff, 0.35);
    panelBg.strokeRoundedRect(-194, 10, 388, 168, 14);

    const pugButton = this.createSpaceButton(0, 52, 300, 58, 'GUIA PUG', 22);
    pugButton.setInteractive(
      new Phaser.Geom.Rectangle(-150, -29, 300, 58),
      Phaser.Geom.Rectangle.Contains
    );
    pugButton.on('pointerdown', () => {
      AudioService.playSFX('correct');
      this.cameras.main.fadeOut(250, 10, 5, 27);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('PugGuideScene');
      });
    });

    const gamesButton = this.createSpaceButton(0, 123, 300, 58, 'OTROS JUEGOS', 22);
    gamesButton.setInteractive(
      new Phaser.Geom.Rectangle(-150, -29, 300, 58),
      Phaser.Geom.Rectangle.Contains
    );
    gamesButton.on('pointerdown', () => this.showComingSoonMessage('Otros juegos'));

    this.versionsPanel.add([panelBg, pugButton, gamesButton]);
    this.tweens.add({
      targets: this.versionsPanel,
      alpha: 1,
      y: 104,
      duration: 180,
      ease: 'Back.easeOut'
    });
  }

  private createSpaceButton(
    x: number,
    y: number,
    buttonWidth: number,
    buttonHeight: number,
    label: string,
    fontSize: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const halfWidth = buttonWidth / 2;
    const halfHeight = buttonHeight / 2;

    const bg = this.add.graphics();
    bg.fillStyle(0x0099ff, 1);
    bg.fillRoundedRect(-halfWidth, -halfHeight, buttonWidth, buttonHeight, halfHeight);
    bg.fillStyle(0x15dfff, 0.95);
    bg.fillRoundedRect(-halfWidth + 8, -halfHeight + 8, buttonWidth - 16, 22, 14);
    bg.fillStyle(0x0064ff, 0.9);
    bg.fillRoundedRect(-halfWidth + 8, -4, buttonWidth - 16, halfHeight - 4, 14);
    bg.lineStyle(5, 0x00279d, 1);
    bg.strokeRoundedRect(-halfWidth, -halfHeight, buttonWidth, buttonHeight, halfHeight);
    bg.lineStyle(2, 0x6dffff, 0.9);
    bg.strokeRoundedRect(-halfWidth + 10, -halfHeight + 10, buttonWidth - 20, buttonHeight - 20, halfHeight - 8);

    const icon = this.add.graphics();
    icon.fillStyle(0xffd23a, 1);
    icon.fillCircle(-halfWidth + 18, 0, 12);
    icon.fillStyle(0x0099ff, 1);
    icon.fillCircle(-halfWidth + 24, -4, 11);
    icon.fillStyle(0xffffff, 0.95);
    icon.fillCircle(-halfWidth + 12, -5, 2);
    icon.fillCircle(-halfWidth + 16, 5, 1.5);

    const title = this.add.text(12, 0, label, {
      fontFamily: '"Outfit", "Inter", Arial, sans-serif',
      fontSize: `${fontSize}px`,
      fontStyle: '900',
      color: '#ffffff',
      stroke: '#06146f',
      strokeThickness: 7
    });
    title.setOrigin(0.5);

    container.add([bg, icon, title]);
    return container;
  }

  private showComingSoonMessage(text: string): void {
    AudioService.playSFX('correct');
    const width = this.cameras.main.width;
    const toast = this.add.text(width / 2, 318, `${text}\nPronto disponible`, {
      fontFamily: '"Outfit", "Inter", Arial, sans-serif',
      fontSize: '24px',
      fontStyle: '800',
      color: '#ffffff',
      align: 'center',
      stroke: '#06146f',
      strokeThickness: 6
    });
    toast.setOrigin(0.5);
    toast.setDepth(20);

    this.tweens.add({
      targets: toast,
      y: 292,
      alpha: 0,
      duration: 1400,
      ease: 'Sine.easeIn',
      onComplete: () => toast.destroy()
    });
  }

  private resize(gameSize: Phaser.Structs.Size): void {
    const width = gameSize.width;
    const height = gameSize.height;
    this.cameras.resize(width, height);
  }

  shutdown(): void {
    if (this.pibbleBlinkTimer) {
      this.pibbleBlinkTimer.destroy();
    }
    this.scale.off('resize', this.resize, this);
  }
}
