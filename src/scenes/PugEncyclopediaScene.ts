import Phaser from 'phaser';
import { AudioService } from '../audio/AudioService';

type OceanCard = {
  title: string;
  icon: string;
  color: number;
  text: string;
};

export class PugEncyclopediaScene extends Phaser.Scene {
  private modal?: Phaser.GameObjects.Container;
  private currentIndex = 0;

  private readonly cards: OceanCard[] = [
    {
      title: 'Zonas del oceano',
      icon: 'waves',
      color: 0x3db7ff,
      text: 'El oceano se divide en zonas segun la profundidad y la cantidad de luz. Estas zonas ayudan a entender que animales pueden vivir en cada parte.'
    },
    {
      title: 'Zona de Luz',
      icon: 'sun',
      color: 0xffd166,
      text: 'Va de 0 a 200 m aproximadamente. Hay suficiente luz para la fotosintesis y existe una gran diversidad de vida marina.'
    },
    {
      title: 'Zona Crepuscular',
      icon: 'moon',
      color: 0x5fa8d3,
      text: 'Va de 200 a 1.000 m aproximadamente. La luz disminuye mucho y ya no alcanza para realizar fotosintesis.'
    },
    {
      title: 'Zona de Medianoche',
      icon: 'dark',
      color: 0x1d3557,
      text: 'Va de 1.000 a 4.000 m. No llega la luz solar y los animales necesitan adaptaciones especiales para sobrevivir.'
    },
    {
      title: 'Zona Abisal',
      icon: 'rock',
      color: 0x14213d,
      text: 'Va de 4.000 a 6.000 m. Tiene oscuridad total, bajas temperaturas y una presion enorme.'
    },
    {
      title: 'Zona Hadal',
      icon: 'trench',
      color: 0x080f2b,
      text: 'Esta en fosas oceanicas por debajo de los 6.000 m. Son algunas de las regiones mas profundas del planeta.'
    },
    {
      title: 'Bioluminiscencia',
      icon: 'glow',
      color: 0x7df9ff,
      text: 'Algunos organismos producen luz. La usan para atraer presas, defenderse, camuflarse o comunicarse en la oscuridad.'
    },
    {
      title: 'Animales profundos',
      icon: 'fish',
      color: 0xb388ff,
      text: 'Peces, calamares y otros organismos sobreviven con poca luz gracias a ojos grandes, cuerpos oscuros o luces propias.'
    },
    {
      title: 'Temperatura',
      icon: 'temp',
      color: 0x90e0ef,
      text: 'La temperatura cambia con la profundidad. Cerca de la superficie suele ser mas calida y en zonas profundas es fria.'
    },
    {
      title: 'Presion',
      icon: 'pressure',
      color: 0xffb703,
      text: 'Cuanto mas descendemos, mayor es la presion del agua. Los organismos profundos estan adaptados a esas condiciones.'
    },
    {
      title: 'Fuentes hidrotermales',
      icon: 'vent',
      color: 0xff6b35,
      text: 'Son estructuras del fondo marino que expulsan agua caliente. A su alrededor existen ecosistemas que no dependen directamente del Sol.'
    },
    {
      title: 'Exploracion del oceano',
      icon: 'sub',
      color: 0xffd23a,
      text: 'Las grandes profundidades son dificiles de investigar. Por eso se usan submarinos y vehiculos de exploracion.'
    }
  ];

  constructor() {
    super('PugEncyclopediaScene');
  }

  create(): void {
    this.cameras.main.fadeIn(350, 0, 18, 45);
    this.drawBackground();
    this.createHeader();
    this.createCardGrid();
    this.createBackButton();
  }

  private drawBackground(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x2f9bd7, 0x1672a8, 0x07345d, 0x03162b, 1);
    bg.fillRect(0, 0, width, height);

    for (let i = 0; i < 18; i++) {
      const y = 90 + i * 28;
      const wave = this.add.graphics();
      wave.lineStyle(2, 0xbdefff, 0.09);
      wave.beginPath();
      wave.moveTo(0, y);
      for (let x = 0; x <= width; x += 80) {
        wave.lineTo(x, y + Math.sin((x + i * 30) / 70) * 9);
      }
      wave.strokePath();
    }
  }

  private createHeader(): void {
    const width = this.cameras.main.width;
    this.add.text(width / 2, 34, 'ENCICLOPEDIA DEL OCEANO', {
      font: 'bold 38px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#00304f',
      strokeThickness: 7
    }).setOrigin(0.5);

    this.add.text(width / 2, 68, 'Informacion para aprender y avanzar en la aventura', {
      font: 'bold 24px "Outfit", "Inter", Arial, sans-serif',
      color: '#dff8ff',
      stroke: '#00304f',
      strokeThickness: 4
    }).setOrigin(0.5);
  }

  private createCardGrid(): void {
    this.cards.forEach((card, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      this.createSmallCard(185 + col * 305, 150 + row * 136, card, index);
    });
  }

  private createSmallCard(x: number, y: number, card: OceanCard, index: number): void {
    const container = this.add.container(x, y);
    const bg = this.add.graphics();
    bg.fillStyle(0xeafbff, 0.94);
    bg.fillRoundedRect(-136, -55, 272, 110, 12);
    bg.lineStyle(4, card.color, 1);
    bg.strokeRoundedRect(-136, -55, 272, 110, 12);

    const icon = this.add.graphics();
    this.drawIcon(icon, -101, -8, card, 1.12);

    const title = this.add.text(-56, -34, card.title, {
      font: 'bold 22px "Outfit", "Inter", Arial, sans-serif',
      color: '#003f66',
      wordWrap: { width: 178 }
    });

    const preview = this.add.text(-56, 12, card.text, {
      font: 'bold 16px "Outfit", "Inter", Arial, sans-serif',
      color: '#24566f',
      wordWrap: { width: 180 }
    });
    preview.setMaxLines(3);

    container.add([bg, icon, title, preview]);
    container.setSize(272, 110);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerover', () => container.setScale(1.03));
    container.on('pointerout', () => container.setScale(1));
    container.on('pointerdown', () => {
      AudioService.playSFX('correct');
      this.openCard(index);
    });
  }

  private openCard(index: number): void {
    this.currentIndex = Phaser.Math.Wrap(index, 0, this.cards.length);
    if (this.modal) {
      this.modal.destroy();
    }

    const card = this.cards[this.currentIndex];
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    this.modal = this.add.container(0, 0).setDepth(50);

    const shade = this.add.rectangle(width / 2, height / 2, width, height, 0x001629, 0.72);
    const box = this.add.graphics();
    box.fillStyle(0xf0fcff, 0.98);
    box.fillRoundedRect(width / 2 - 420, height / 2 - 215, 840, 430, 18);
    box.lineStyle(6, card.color, 1);
    box.strokeRoundedRect(width / 2 - 420, height / 2 - 215, 840, 430, 18);

    const icon = this.add.graphics();
    this.drawIcon(icon, width / 2 - 300, height / 2 - 62, card, 2.35);

    const title = this.add.text(width / 2, height / 2 - 142, card.title, {
      font: 'bold 46px "Outfit", "Inter", Arial, sans-serif',
      color: '#003f66',
      align: 'center'
    }).setOrigin(0.5);

    const text = this.add.text(width / 2 - 168, height / 2 - 70, card.text, {
      font: 'bold 36px "Outfit", "Inter", Arial, sans-serif',
      color: '#17455c',
      wordWrap: { width: 530 },
      lineSpacing: 8
    });

    const note = this.add.text(width / 2, height / 2 + 112, 'Estas tarjetas te ayudan a resolver los niveles. Las burbujas del juego son datos curiosos.', {
      font: 'bold 26px "Outfit", "Inter", Arial, sans-serif',
      color: '#0077a8',
      align: 'center',
      wordWrap: { width: 660 }
    }).setOrigin(0.5);

    const prev = this.createModalButton(width / 2 - 250, height / 2 + 166, '<');
    const close = this.createModalButton(width / 2, height / 2 + 166, 'CERRAR');
    const next = this.createModalButton(width / 2 + 250, height / 2 + 166, '>');

    prev.on('pointerdown', () => this.openCard(this.currentIndex - 1));
    close.on('pointerdown', () => {
      AudioService.playSFX('click');
      this.modal?.destroy();
      this.modal = undefined;
    });
    next.on('pointerdown', () => this.openCard(this.currentIndex + 1));

    this.modal.add([shade, box, icon, title, text, note, prev, close, next]);
  }

  private createModalButton(x: number, y: number, label: string): Phaser.GameObjects.Text {
    const button = this.add.text(x, y, label, {
      font: 'bold 25px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      backgroundColor: '#008ec4',
      padding: { x: 18, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    button.on('pointerover', () => button.setScale(1.05));
    button.on('pointerout', () => button.setScale(1));
    return button;
  }

  private drawIcon(graphics: Phaser.GameObjects.Graphics, x: number, y: number, card: OceanCard, scale = 1): void {
    graphics.fillStyle(0xffffff, 0.35);
    graphics.fillCircle(x, y, 35 * scale);
    graphics.fillStyle(card.color, 1);
    graphics.lineStyle(3 * scale, 0x003f66, 1);

    if (card.icon === 'sun') {
      graphics.lineStyle(4 * scale, 0xffa200, 1);
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8;
        graphics.lineBetween(
          x + Math.cos(angle) * 24 * scale,
          y + Math.sin(angle) * 24 * scale,
          x + Math.cos(angle) * 35 * scale,
          y + Math.sin(angle) * 35 * scale
        );
      }
      graphics.fillStyle(0xffd166, 1);
      graphics.fillCircle(x, y, 20 * scale);
      graphics.fillStyle(0xffffff, 0.55);
      graphics.fillCircle(x - 7 * scale, y - 7 * scale, 7 * scale);
      return;
    }

    if (card.icon === 'sub') {
      graphics.fillStyle(0xffd23a, 1);
      graphics.fillEllipse(x, y, 62 * scale, 27 * scale);
      graphics.lineStyle(3 * scale, 0x6a3d00, 1);
      graphics.strokeEllipse(x, y, 62 * scale, 27 * scale);
      graphics.fillStyle(0xff6b35, 1);
      graphics.fillTriangle(x - 30 * scale, y, x - 48 * scale, y - 13 * scale, x - 48 * scale, y + 13 * scale);
      graphics.fillStyle(0x7ee7ff, 1);
      graphics.fillCircle(x - 11 * scale, y - 1 * scale, 6 * scale);
      graphics.fillCircle(x + 10 * scale, y - 1 * scale, 6 * scale);
      return;
    }

    if (card.icon === 'glow') {
      graphics.fillStyle(0x7df9ff, 0.25);
      graphics.fillCircle(x, y, 39 * scale);
      graphics.fillStyle(0x7df9ff, 0.55);
      graphics.fillCircle(x, y, 27 * scale);
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(x, y, 12 * scale);
      graphics.lineStyle(3 * scale, 0x7df9ff, 0.9);
      graphics.strokeCircle(x, y, 32 * scale);
      return;
    }

    if (card.icon === 'temp') {
      graphics.fillStyle(0xdff8ff, 1);
      graphics.fillRoundedRect(x - 8 * scale, y - 24 * scale, 16 * scale, 38 * scale, 8 * scale);
      graphics.lineStyle(3 * scale, 0x005f99, 1);
      graphics.strokeRoundedRect(x - 8 * scale, y - 24 * scale, 16 * scale, 38 * scale, 8 * scale);
      graphics.fillStyle(0x00a6fb, 1);
      graphics.fillRoundedRect(x - 4 * scale, y - 5 * scale, 8 * scale, 20 * scale, 4 * scale);
      graphics.fillStyle(0xff6b35, 1);
      graphics.fillCircle(x, y + 18 * scale, 15 * scale);
      return;
    }

    if (card.icon === 'pressure') {
      graphics.fillStyle(0xffd166, 1);
      graphics.fillCircle(x, y, 25 * scale);
      graphics.lineStyle(4 * scale, 0x003f66, 1);
      graphics.strokeCircle(x, y, 25 * scale);
      graphics.fillStyle(0x003f66, 1);
      graphics.fillTriangle(x - 34 * scale, y, x - 19 * scale, y - 9 * scale, x - 19 * scale, y + 9 * scale);
      graphics.fillTriangle(x + 34 * scale, y, x + 19 * scale, y - 9 * scale, x + 19 * scale, y + 9 * scale);
      graphics.fillTriangle(x, y - 34 * scale, x - 9 * scale, y - 19 * scale, x + 9 * scale, y - 19 * scale);
      graphics.fillTriangle(x, y + 34 * scale, x - 9 * scale, y + 19 * scale, x + 9 * scale, y + 19 * scale);
      return;
    }

    if (card.icon === 'fish') {
      graphics.fillStyle(card.color, 1);
      graphics.fillEllipse(x, y, 58 * scale, 28 * scale);
      graphics.fillTriangle(x + 25 * scale, y, x + 49 * scale, y - 18 * scale, x + 49 * scale, y + 18 * scale);
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(x - 18 * scale, y - 6 * scale, 5 * scale);
      graphics.fillStyle(0x003f66, 1);
      graphics.fillCircle(x - 17 * scale, y - 6 * scale, 2 * scale);
      graphics.lineStyle(3 * scale, 0xffffff, 0.8);
      graphics.lineBetween(x - 2 * scale, y - 14 * scale, x - 10 * scale, y - 30 * scale);
      return;
    }

    if (card.icon === 'vent') {
      graphics.fillStyle(0x3a2d28, 1);
      graphics.fillTriangle(x - 27 * scale, y + 27 * scale, x - 7 * scale, y - 28 * scale, x + 6 * scale, y + 27 * scale);
      graphics.fillTriangle(x - 3 * scale, y + 27 * scale, x + 13 * scale, y - 18 * scale, x + 29 * scale, y + 27 * scale);
      graphics.fillStyle(0xff6b35, 1);
      graphics.fillCircle(x + 2 * scale, y - 31 * scale, 7 * scale);
      graphics.fillStyle(0xffffff, 0.7);
      graphics.fillCircle(x - 9 * scale, y - 43 * scale, 5 * scale);
      graphics.fillCircle(x + 14 * scale, y - 49 * scale, 4 * scale);
      return;
    }

    if (card.icon === 'rock' || card.icon === 'trench') {
      graphics.fillStyle(card.icon === 'trench' ? 0x080f2b : 0x33415c, 1);
      graphics.fillTriangle(x - 34 * scale, y + 26 * scale, x - 14 * scale, y - 18 * scale, x + 5 * scale, y + 26 * scale);
      graphics.fillTriangle(x - 5 * scale, y + 26 * scale, x + 12 * scale, y - 28 * scale, x + 35 * scale, y + 26 * scale);
      graphics.fillStyle(0x001d3d, 0.9);
      graphics.fillTriangle(x - 10 * scale, y + 25 * scale, x, y - 4 * scale, x + 13 * scale, y + 25 * scale);
      return;
    }

    if (card.icon === 'moon' || card.icon === 'dark') {
      graphics.fillStyle(card.icon === 'dark' ? 0x10213d : 0x9bd0ff, 1);
      graphics.fillCircle(x, y, 25 * scale);
      graphics.fillStyle(0xeafbff, 1);
      graphics.fillCircle(x + 11 * scale, y - 8 * scale, 24 * scale);
      graphics.fillStyle(0xffffff, 0.95);
      graphics.fillCircle(x - 28 * scale, y - 22 * scale, 3 * scale);
      graphics.fillCircle(x + 24 * scale, y + 20 * scale, 2.5 * scale);
      return;
    }

    graphics.lineStyle(5 * scale, 0xbdefff, 1);
    graphics.beginPath();
    graphics.moveTo(x - 34 * scale, y - 7 * scale);
    graphics.lineTo(x - 18 * scale, y - 18 * scale);
    graphics.lineTo(x, y - 7 * scale);
    graphics.lineTo(x + 18 * scale, y - 18 * scale);
    graphics.lineTo(x + 34 * scale, y - 7 * scale);
    graphics.strokePath();
    graphics.lineStyle(5 * scale, 0x3db7ff, 1);
    graphics.beginPath();
    graphics.moveTo(x - 34 * scale, y + 10 * scale);
    graphics.lineTo(x - 18 * scale, y);
    graphics.lineTo(x, y + 10 * scale);
    graphics.lineTo(x + 18 * scale, y);
    graphics.lineTo(x + 34 * scale, y + 10 * scale);
    graphics.strokePath();
  }

  private createBackButton(): void {
    const width = this.cameras.main.width;
    const back = this.add.text(width - 28, 34, 'VOLVER', {
      font: 'bold 24px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#00304f',
      strokeThickness: 5
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

    back.on('pointerdown', () => {
      AudioService.playSFX('click');
      this.scene.start('PugGuideScene');
    });
  }
}
