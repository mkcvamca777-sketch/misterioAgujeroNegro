import Phaser from 'phaser';
import { AudioService } from '../audio/AudioService';

export class MainMenuScene extends Phaser.Scene {
  private buttons: Phaser.GameObjects.Sprite[] = [];
  private pibbleBlinkTimer!: Phaser.Time.TimerEvent;

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

    // 2. Add dynamic interactive animations on the background elements
    // Ensure we create textures first
    this.createPibbleWandSparkles();
    this.createBlackHoleAnimation();
    this.createLanternFlicker();
    this.createObservatoryGlow();
    this.createPibbleBlinking();

    // 3. Create Buttons (Capa 3)
    this.createCroppedButtons();

    // 4. Handle resize events to keep centering (responsive)
    this.scale.on('resize', this.resize, this);
  }

  private createBlackHoleAnimation(): void {
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
    // Observatory window is at X=86, Y=355
    const windowGlow = this.add.polygon(
      86, 355,
      [
        0, 0,
        20, -10,
        40, 0,
        35, 30,
        5, 30
      ],
      0xffa500,
      0.15
    );
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
    // Define crop boxes inside the high-res button images (to crop the transparent margins)
    const btnData = [
      { key: 'btn_comenzar', scene: 'Level2Scene', crop: { x: 152, y: 232, w: 728, h: 188 } },
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

      // Vertical layout in a 1024x576 canvas
      const targetY = 365 + (index * 40);
      const btnSprite = this.add.sprite(512, targetY, btn.key, 'crop');
      
      // Calculate uniform scale based on target width to preserve aspect ratio
      const targetWidth = 170;
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
              this.scene.start(btn.scene);
            });
          }
        });
      });
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
