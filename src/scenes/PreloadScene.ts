import Phaser from 'phaser';
import { AudioService } from '../audio/AudioService';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Create space background with stars
    const spaceBg = this.add.graphics();
    spaceBg.fillStyle(0x0a051b, 1);
    spaceBg.fillRect(0, 0, width, height);

    // Draw some random background stars
    for (let i = 0; i < 100; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.FloatBetween(0.5, 2);
      const alpha = Phaser.Math.FloatBetween(0.2, 1);
      
      const star = this.add.circle(x, y, size, 0xffffff, alpha);
      
      // Twinkle animation
      this.tweens.add({
        targets: star,
        alpha: 0.1,
        duration: Phaser.Math.Between(800, 2000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 1000)
      });
    }

    // Title text
    const titleText = this.make.text({
      x: width / 2,
      y: height / 2 - 120,
      text: 'EL MISTERIO DEL AGUJERO NEGRO',
      style: {
        font: 'bold 40px "Outfit", "Inter", sans-serif',
        color: '#ffffff',
        align: 'center'
      }
    });
    titleText.setOrigin(0.5, 0.5);

    const subtitleText = this.make.text({
      x: width / 2,
      y: height / 2 - 70,
      text: 'Cargando aventura espacial con el Profesor Pibble...',
      style: {
        font: '20px "Outfit", "Inter", sans-serif',
        color: '#a092ff',
        align: 'center'
      }
    });
    subtitleText.setOrigin(0.5, 0.5);

    // Progress bar components
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x221c38, 0.8);
    progressBox.fillRoundedRect(width / 2 - 200, height / 2 - 15, 400, 30, 8);

    // Progress text
    const percentText = this.make.text({
      x: width / 2,
      y: height / 2 + 40,
      text: '0%',
      style: {
        font: '18px monospace',
        color: '#ffffff'
      }
    });
    percentText.setOrigin(0.5, 0.5);

    // Event listeners for loader progress
    this.load.on('progress', (value: number) => {
      percentText.setText(parseInt((value * 100).toString()) + '%');
      progressBar.clear();
      progressBar.fillStyle(0xffa500, 1);
      progressBar.fillRoundedRect(width / 2 - 195, height / 2 - 10, 390 * value, 20, 6);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      percentText.destroy();
      titleText.destroy();
      subtitleText.destroy();
    });

    // Load static image assets
    this.load.image('menu_bg_new', 'assets/menu_bg_new.jpg');
    this.load.image('btn_comenzar', 'assets/btn_comenzar.png');
    this.load.image('btn_enciclopedia', 'assets/btn_enciclopedia.png');
    this.load.image('btn_insignias', 'assets/btn_insignias.png');
    this.load.image('btn_configuracion', 'assets/btn_configuracion.png');
    this.load.image('btn_creditos', 'assets/btn_creditos.png');
    this.load.image('certificado_nivel1', 'assets/certificado_nivel1.jpg');
    this.load.image('certificado_nivel1', 'assets/certificado_nivel1.jpg');
    this.load.image('certificado_nivel4', 'assets/certificado_nivel4.jpg');
    this.load.image('btn_reintentar', 'assets/btn_reintentar.png');
    this.load.image('btn_volver_menu', 'assets/btn_volver_menu.png');
    this.load.image('bg_game_over', 'assets/bg_game_over.png');
  }

  create(): void {
    // Initialize our audio helper
    AudioService.initialize();
    
    // Start ambient background music
    AudioService.playMusic();

    // Transition to the main menu with a beautiful fade camera effect
    this.cameras.main.fadeOut(500, 10, 5, 27);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('MainMenuScene');
    });
  }
}
