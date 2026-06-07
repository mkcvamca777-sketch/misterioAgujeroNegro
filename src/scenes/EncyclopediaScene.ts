import Phaser from 'phaser';
import { AudioService } from '../audio/AudioService';

export class EncyclopediaScene extends Phaser.Scene {
  private currentPage = 0;
  private pages = [
    {
      title: '¿Qué es un Agujero Negro?',
      content: 'Es una región del espacio donde la materia se ha comprimido tanto en sí misma que nada, ni siquiera la luz, puede escapar de su fuerza de gravedad. ¡Es como un sumidero cósmico gigante!'
    },
    {
      title: 'El Horizonte de Sucesos',
      content: 'Es la "frontera" o el punto de no retorno alrededor del agujero negro. Si cruzas esta línea imaginaria, la gravedad es tan fuerte que será imposible salir o enviar señales al exterior.'
    },
    {
      title: 'La Singularidad',
      content: 'En el centro mismo del agujero negro se encuentra la singularidad. Toda la masa del agujero se comprime en un punto infinitamente pequeño y denso, donde las leyes de la física normal dejan de funcionar.'
    },
    {
      title: '¿Cómo se forman?',
      content: 'La mayoría de los agujeros negros se forman cuando una estrella gigante (mucho más grande que nuestro Sol) se queda sin combustible al final de su vida y colapsa sobre sí misma en una explosión de Supernova.'
    }
  ];

  private pageTitleText!: Phaser.GameObjects.Text;
  private pageContentText!: Phaser.GameObjects.Text;
  private pageNumText!: Phaser.GameObjects.Text;

  constructor() {
    super('EncyclopediaScene');
  }

  create(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Cosmic Wash Background
    const bg = this.add.graphics();
    bg.fillStyle(0x050212, 1);
    bg.fillRect(0, 0, width, height);

    // Glowing nebulas
    const nebula = this.add.graphics();
    nebula.fillStyle(0x311b92, 0.4);
    nebula.fillCircle(width - 200, 150, 200);
    nebula.fillStyle(0x4a148c, 0.3);
    nebula.fillCircle(150, height - 150, 180);

    // Tweens for nebulas pulse
    this.tweens.add({
      targets: nebula,
      alpha: 0.7,
      duration: 4000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Panel Window
    const panel = this.add.graphics();
    panel.fillStyle(0x110a27, 0.9);
    panel.lineStyle(4, 0x0288d1, 1);
    panel.fillRoundedRect(width / 2 - 400, height / 2 - 250, 800, 480, 20);
    panel.strokeRoundedRect(width / 2 - 400, height / 2 - 250, 800, 480, 20);

    // Book header icon / decoration
    this.add.text(width / 2, height / 2 - 210, 'ENCICLOPEDIA ESPACIAL', {
      font: 'bold 32px "Outfit", "Inter", sans-serif',
      color: '#00e5ff'
    }).setOrigin(0.5);

    // Page text containers
    this.pageTitleText = this.add.text(width / 2 - 340, height / 2 - 130, '', {
      font: 'bold 26px "Outfit", "Inter", sans-serif',
      color: '#ffc107',
      wordWrap: { width: 680 }
    });

    this.pageContentText = this.add.text(width / 2 - 340, height / 2 - 70, '', {
      font: '20px "Outfit", "Inter", sans-serif',
      color: '#ffffff',
      lineSpacing: 8,
      wordWrap: { width: 680 }
    });

    this.pageNumText = this.add.text(width / 2, height / 2 + 150, '', {
      font: '16px monospace',
      color: '#00e5ff'
    }).setOrigin(0.5);

    // Render initial page
    this.showPage(0);

    // Navigation buttons
    // Previous Page Button
    const btnPrev = this.add.graphics();
    btnPrev.fillStyle(0x0288d1, 1);
    btnPrev.fillTriangle(width / 2 - 120, height / 2 + 150, width / 2 - 90, height / 2 + 135, width / 2 - 90, height / 2 + 165);
    const prevZone = this.add.zone(width / 2 - 105, height / 2 + 150, 50, 40).setInteractive({ useHandCursor: true });
    
    prevZone.on('pointerdown', () => {
      if (this.currentPage > 0) {
        AudioService.playSFX('click');
        this.showPage(this.currentPage - 1);
      }
    });

    // Next Page Button
    const btnNext = this.add.graphics();
    btnNext.fillStyle(0x0288d1, 1);
    btnNext.fillTriangle(width / 2 + 120, height / 2 + 150, width / 2 + 90, height / 2 + 135, width / 2 + 90, height / 2 + 165);
    const nextZone = this.add.zone(width / 2 + 105, height / 2 + 150, 50, 40).setInteractive({ useHandCursor: true });

    nextZone.on('pointerdown', () => {
      if (this.currentPage < this.pages.length - 1) {
        AudioService.playSFX('click');
        this.showPage(this.currentPage + 1);
      }
    });

    // Close / Back button
    const btnBack = this.add.graphics();
    btnBack.fillStyle(0xff5722, 1);
    btnBack.fillRoundedRect(width / 2 - 100, height / 2 + 180, 200, 40, 8);

    this.add.text(width / 2, height / 2 + 200, 'MENÚ PRINCIPAL', {
      font: 'bold 16px "Outfit", "Inter", sans-serif',
      color: '#ffffff'
    }).setOrigin(0.5);

    const backZone = this.add.zone(width / 2, height / 2 + 200, 200, 40).setInteractive({ useHandCursor: true });
    backZone.on('pointerdown', () => {
      AudioService.playSFX('click');
      this.cameras.main.fadeOut(400, 10, 5, 27);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('MainMenuScene');
      });
    });
  }

  private showPage(index: number): void {
    this.currentPage = index;
    const page = this.pages[index];
    this.pageTitleText.setText(page.title);
    this.pageContentText.setText(page.content);
    this.pageNumText.setText(`Pág. ${index + 1} de ${this.pages.length}`);
  }
}
