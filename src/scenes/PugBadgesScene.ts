import Phaser from 'phaser';
import { AudioService } from '../audio/AudioService';
import { StorageService } from '../utils/StorageService';

type PugBadge = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  colors: [number, number];
  icon: 'light' | 'twilight' | 'midnight' | 'abyssal' | 'hadal';
};

export class PugBadgesScene extends Phaser.Scene {
  private selectedPanel?: Phaser.GameObjects.Container;

  private readonly badges: PugBadge[] = [
    {
      id: 'pug_luz',
      title: 'EXPLORADOR DE LA ZONA DE LUZ',
      subtitle: 'Nivel 1 completado',
      description: 'Has explorado los primeros 200 metros del oceano.',
      colors: [0xffd166, 0x00a6fb],
      icon: 'light'
    },
    {
      id: 'pug_crepuscular',
      title: 'EXPLORADOR CREPUSCULAR',
      subtitle: 'Nivel 2 completado',
      description: 'Encontraste criaturas que sobreviven con muy poca luz.',
      colors: [0x5fa8d3, 0x061a40],
      icon: 'twilight'
    },
    {
      id: 'pug_medianoche',
      title: 'EXPLORADOR DE MEDIANOCHE',
      subtitle: 'Nivel 3 completado',
      description: 'Descubriste la oscuridad total y la bioluminiscencia.',
      colors: [0x7df9ff, 0x12123f],
      icon: 'midnight'
    },
    {
      id: 'pug_abisal',
      title: 'EXPLORADOR ABISAL',
      subtitle: 'Nivel 4 completado',
      description: 'Llegaste a una zona fria, oscura y de gran presion.',
      colors: [0x4361ee, 0x050816],
      icon: 'abyssal'
    },
    {
      id: 'pug_hadal',
      title: 'EXPLORADOR HADAL',
      subtitle: 'Nivel 5 completado',
      description: 'Alcanzaste las fosas mas profundas de la expedicion.',
      colors: [0xffd23a, 0x020617],
      icon: 'hadal'
    }
  ];

  constructor() {
    super('PugBadgesScene');
  }

  create(): void {
    this.cameras.main.fadeIn(350, 0, 14, 33);
    this.drawBackground();
    this.createHeader();
    this.createBadges();
    this.createBackButton();
  }

  private drawBackground(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x177fb7, 0x0d5b89, 0x052846, 0x010915, 1);
    bg.fillRect(0, 0, width, height);

    for (let i = 0; i < 24; i++) {
      const bubble = this.add.circle(
        Phaser.Math.Between(20, width - 20),
        Phaser.Math.Between(90, height - 20),
        Phaser.Math.FloatBetween(2, 7),
        0xd8f7ff,
        0.18
      );
      this.tweens.add({
        targets: bubble,
        y: bubble.y - Phaser.Math.Between(30, 90),
        alpha: 0.05,
        duration: Phaser.Math.Between(2400, 5200),
        yoyo: true,
        repeat: -1
      });
    }
  }

  private createHeader(): void {
    const width = this.cameras.main.width;
    const unlocked = this.getUnlockedBadges().length;

    this.add.text(width / 2, 42, `INSIGNIAS ${unlocked} / ${this.badges.length}`, {
      font: 'bold 46px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#002a44',
      strokeThickness: 8
    }).setOrigin(0.5);

    this.add.text(width / 2, 84, 'Todo lo conseguido durante tu expedicion', {
      font: 'bold 28px "Outfit", "Inter", Arial, sans-serif',
      color: '#dff8ff',
      stroke: '#002a44',
      strokeThickness: 5
    }).setOrigin(0.5);
  }

  private createBadges(): void {
    const startX = 190;
    const y = 285;

    this.badges.forEach((badge, index) => {
      const unlocked = this.getUnlockedBadges().includes(badge.id);
      const badgeView = this.add.container(startX + index * 225, y);
      this.drawBadge(badgeView, badge, unlocked);
      badgeView.setSize(170, 220);
      badgeView.setInteractive({ useHandCursor: true });
      badgeView.on('pointerover', () => badgeView.setScale(1.04));
      badgeView.on('pointerout', () => badgeView.setScale(1));
      badgeView.on('pointerdown', () => {
        AudioService.playSFX(unlocked ? 'correct' : 'click');
        this.showBadgeInfo(badge, unlocked);
      });
    });
  }

  private drawBadge(container: Phaser.GameObjects.Container, badge: PugBadge, unlocked: boolean): void {
    const [mainColor, deepColor] = unlocked ? badge.colors : [0x243447, 0x101820];
    const medal = this.add.graphics();

    medal.fillStyle(0x001629, 0.55);
    medal.fillEllipse(0, 18, 150, 168);
    medal.fillStyle(mainColor, 1);
    medal.fillCircle(0, 0, 76);
    medal.fillStyle(deepColor, 0.9);
    medal.fillCircle(0, 0, 58);
    medal.lineStyle(7, unlocked ? 0xfff3b0 : 0x607080, 1);
    medal.strokeCircle(0, 0, 76);
    medal.lineStyle(3, 0xffffff, unlocked ? 0.55 : 0.15);
    medal.strokeCircle(0, 0, 55);

    const ribbon = this.add.graphics();
    ribbon.fillStyle(unlocked ? 0x0a8dc4 : 0x2b3b4c, 1);
    ribbon.fillTriangle(-38, 58, -8, 58, -22, 122);
    ribbon.fillTriangle(8, 58, 38, 58, 22, 122);

    const icon = this.add.graphics();
    this.drawIcon(icon, badge, unlocked);

    const lock = this.add.text(0, 4, unlocked ? '' : 'LOCK', {
      font: 'bold 22px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#001629',
      strokeThickness: 5
    }).setOrigin(0.5);

    const label = this.add.text(0, 145, this.shortName(badge.icon), {
      font: 'bold 23px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#002a44',
      strokeThickness: 5,
      align: 'center',
      wordWrap: { width: 190 }
    }).setOrigin(0.5);

    container.add([ribbon, medal, icon, lock, label]);
    if (!unlocked) {
      container.setAlpha(0.78);
    }
  }

  private drawIcon(graphics: Phaser.GameObjects.Graphics, badge: PugBadge, unlocked: boolean): void {
    const alpha = unlocked ? 1 : 0.22;
    graphics.setAlpha(alpha);

    if (badge.icon === 'light') {
      graphics.fillStyle(0xfff06a, 1);
      graphics.fillCircle(-18, -16, 18);
      graphics.lineStyle(5, 0x8ed8ff, 1);
      graphics.beginPath();
      graphics.moveTo(-45, 22);
      graphics.lineTo(-22, 10);
      graphics.lineTo(0, 22);
      graphics.lineTo(22, 10);
      graphics.lineTo(45, 22);
      graphics.strokePath();
      return;
    }

    if (badge.icon === 'twilight') {
      graphics.fillStyle(0x8ed8ff, 1);
      graphics.fillRect(-48, -30, 96, 60);
      graphics.fillStyle(0x061a40, 0.86);
      graphics.fillRect(0, -30, 48, 60);
      graphics.fillStyle(0xffd166, 1);
      graphics.fillCircle(-22, -7, 14);
      return;
    }

    if (badge.icon === 'midnight') {
      graphics.fillStyle(0x020617, 1);
      graphics.fillCircle(0, 0, 44);
      graphics.fillStyle(0x7df9ff, 0.35);
      graphics.fillCircle(0, 0, 32);
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(0, 0, 11);
      graphics.fillStyle(0x7df9ff, 1);
      graphics.fillEllipse(0, 18, 54, 22);
      return;
    }

    if (badge.icon === 'abyssal') {
      graphics.fillStyle(0x7b2cbf, 1);
      graphics.fillEllipse(-5, 0, 72, 34);
      graphics.fillTriangle(30, 0, 58, -20, 58, 20);
      graphics.fillStyle(0xffffff, 1);
      graphics.fillCircle(-28, -7, 5);
      graphics.lineStyle(4, 0x7df9ff, 1);
      graphics.lineBetween(-12, -18, -25, -42);
      graphics.fillStyle(0x7df9ff, 1);
      graphics.fillCircle(-27, -45, 6);
      return;
    }

    graphics.fillStyle(0x020617, 1);
    graphics.fillTriangle(-48, 36, -18, -36, 2, 36);
    graphics.fillTriangle(-4, 36, 20, -44, 50, 36);
    graphics.fillStyle(0xffd23a, 1);
    graphics.fillEllipse(18, -5, 58, 25);
    graphics.fillStyle(0x7ee7ff, 1);
    graphics.fillCircle(6, -6, 5);
  }

  private showBadgeInfo(badge: PugBadge, unlocked: boolean): void {
    if (this.selectedPanel) {
      this.selectedPanel.destroy();
    }

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    this.selectedPanel = this.add.container(0, 0).setDepth(40);

    const shade = this.add.rectangle(width / 2, height / 2, width, height, 0x001629, 0.58);
    const box = this.add.graphics();
    box.fillStyle(0xeafbff, 0.98);
    box.fillRoundedRect(width / 2 - 350, height / 2 - 125, 700, 250, 18);
    box.lineStyle(5, unlocked ? badge.colors[0] : 0x607080, 1);
    box.strokeRoundedRect(width / 2 - 350, height / 2 - 125, 700, 250, 18);

    const title = this.add.text(width / 2, height / 2 - 65, unlocked ? badge.title : 'INSIGNIA BLOQUEADA', {
      font: 'bold 36px "Outfit", "Inter", Arial, sans-serif',
      color: '#003f66',
      align: 'center',
      wordWrap: { width: 620 }
    }).setOrigin(0.5);

    const descText = unlocked
      ? `${badge.subtitle}\n${badge.description}`
      : 'Completa este nivel del oceano para desbloquear esta insignia.';

    const desc = this.add.text(width / 2, height / 2 + 10, descText, {
      font: 'bold 30px "Outfit", "Inter", Arial, sans-serif',
      color: '#17455c',
      align: 'center',
      wordWrap: { width: 610 },
      lineSpacing: 7
    }).setOrigin(0.5);

    const close = this.add.text(width / 2, height / 2 + 88, 'CERRAR', {
      font: 'bold 24px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      backgroundColor: '#008ec4',
      padding: { x: 18, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    close.on('pointerdown', () => {
      AudioService.playSFX('click');
      this.selectedPanel?.destroy();
      this.selectedPanel = undefined;
    });

    this.selectedPanel.add([shade, box, title, desc, close]);
  }

  private shortName(icon: PugBadge['icon']): string {
    const names = {
      light: 'Zona de Luz',
      twilight: 'Zona Crepuscular',
      midnight: 'Zona de Medianoche',
      abyssal: 'Zona Abisal',
      hadal: 'Zona Hadal'
    };
    return names[icon];
  }

  private getUnlockedBadges(): string[] {
    return StorageService.getBadges().filter((badge) => badge.startsWith('pug_'));
  }

  private createBackButton(): void {
    const width = this.cameras.main.width;
    const back = this.add.text(width - 28, 42, 'VOLVER', {
      font: 'bold 24px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#002a44',
      strokeThickness: 5
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

    back.on('pointerdown', () => {
      AudioService.playSFX('click');
      this.scene.start('PugGuideScene');
    });
  }
}
