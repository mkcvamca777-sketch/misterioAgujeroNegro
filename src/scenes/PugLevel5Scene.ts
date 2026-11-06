import Phaser from 'phaser';
import { AudioService } from '../audio/AudioService';
import { StorageService } from '../utils/StorageService';
import { createPugSubmarine } from '../utils/PugOceanArt';

type SystemKey = 'energy' | 'integrity' | 'lights';

type ActiveAlert = {
  type: 'lights' | 'energy' | 'pressure';
  container: Phaser.GameObjects.Container;
  timeLeft: number;
  solved: boolean;
  marker?: Phaser.GameObjects.Rectangle;
  target?: Phaser.GameObjects.Rectangle;
};

export class PugLevel5Scene extends Phaser.Scene {
  private submarine!: Phaser.GameObjects.Container;
  private depthText!: Phaser.GameObjects.Text;
  private heartsText!: Phaser.GameObjects.Text;
  private guideText?: Phaser.GameObjects.Text;
  private systemTexts!: Record<SystemKey, Phaser.GameObjects.Text>;
  private systemBars!: Record<SystemKey, Phaser.GameObjects.Graphics>;
  private systems: Record<SystemKey, number> = { energy: 100, integrity: 100, lights: 100 };
  private lives = 3;
  private depth = 6000;
  private progress = 0;
  private alertIndex = 0;
  private currentPush = 0;
  private ended = false;
  private activeAlerts: ActiveAlert[] = [];

  constructor() {
    super('PugLevel5Scene');
  }

  create(): void {
    this.systems = { energy: 100, integrity: 100, lights: 100 };
    this.lives = 3;
    this.depth = 6000;
    this.progress = 0;
    this.alertIndex = 0;
    this.currentPush = 0;
    this.ended = false;
    this.activeAlerts = [];

    this.cameras.main.fadeIn(450, 0, 0, 0);
    this.drawHadalTrench();
    this.createHeader();
    this.createSystemPanel();
    this.submarine = createPugSubmarine(this, this.cameras.main.width / 2, 132, 12, true);
    this.createGuide('Hemos llegado a la Zona Hadal. Este sera nuestro descenso mas profundo.');
    this.createExitButton();
  }

  update(_time: number, delta: number): void {
    if (this.ended) return;

    const pointer = this.input.activePointer;
    const targetX = Phaser.Math.Clamp(pointer.x + this.currentPush, 150, this.cameras.main.width - 150);
    this.submarine.x = Phaser.Math.Linear(this.submarine.x, targetX, 0.055);
    this.submarine.y = 132 + Math.sin(this.progress / 5) * 10;

    this.progress += delta * 0.006;
    this.depth += delta * 0.024;
    this.depthText.setText(`PROFUNDIDAD: ${Math.round(this.depth).toLocaleString('es-ES')} m`);

    this.drainSystems(delta);
    this.updateActiveAlerts(delta);
    this.maybeTriggerAlert();

    if (this.progress >= 100 && this.activeAlerts.length === 0) {
      this.reachBottom();
    }
  }

  private drawHadalTrench(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x031126, 0x020817, 0x000208, 0x000000, 1);
    bg.fillRect(0, 0, width, height);

    const trench = this.add.graphics();
    trench.fillStyle(0x000000, 0.9);
    trench.fillTriangle(width / 2 - 330, height, width / 2 - 105, 118, width / 2 - 10, height);
    trench.fillTriangle(width / 2 + 10, height, width / 2 + 115, 118, width / 2 + 340, height);
    trench.lineStyle(5, 0x0b2d44, 0.85);
    trench.lineBetween(width / 2 - 105, 118, width / 2 - 330, height);
    trench.lineBetween(width / 2 + 115, 118, width / 2 + 340, height);

    for (let i = 0; i < 46; i++) {
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
    this.add.text(width / 2, 30, 'NIVEL 5 - ZONA HADAL', {
      font: 'bold 37px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000713',
      strokeThickness: 7
    }).setOrigin(0.5).setDepth(40);

    this.depthText = this.add.text(28, 28, 'PROFUNDIDAD: 6.000 m', {
      font: 'bold 24px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000713',
      strokeThickness: 5
    }).setDepth(40);

    this.heartsText = this.add.text(28, 60, '♥ ♥ ♥', {
      font: 'bold 37px Arial',
      color: '#ff4d6d',
      stroke: '#ffffff',
      strokeThickness: 3
    }).setDepth(40);
  }

  private createSystemPanel(): void {
    const x = 930;
    const y = 92;
    const panel = this.add.graphics().setDepth(40);
    panel.fillStyle(0x001629, 0.72);
    panel.fillRoundedRect(x, y, 310, 175, 18);
    panel.lineStyle(4, 0x7df9ff, 0.8);
    panel.strokeRoundedRect(x, y, 310, 175, 18);

    this.systemTexts = {
      energy: this.add.text(x + 22, y + 28, '', this.systemTextStyle()).setDepth(41),
      integrity: this.add.text(x + 22, y + 78, '', this.systemTextStyle()).setDepth(41),
      lights: this.add.text(x + 22, y + 128, '', this.systemTextStyle()).setDepth(41)
    };
    this.systemBars = {
      energy: this.add.graphics().setDepth(41),
      integrity: this.add.graphics().setDepth(41),
      lights: this.add.graphics().setDepth(41)
    };
    this.updateSystemPanel();
  }

  private systemTextStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return {
      font: 'bold 24px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000713',
      strokeThickness: 4
    };
  }

  private drainSystems(delta: number): void {
    this.systems.energy = Phaser.Math.Clamp(this.systems.energy - delta * 0.004, 0, 100);
    this.systems.integrity = Phaser.Math.Clamp(this.systems.integrity - delta * 0.002, 0, 100);
    this.systems.lights = Phaser.Math.Clamp(this.systems.lights - delta * 0.003, 0, 100);
    this.updateSystemPanel();
  }

  private updateSystemPanel(): void {
    this.systemTexts.energy.setText(`ENERGIA - ${Math.round(this.systems.energy)} %`);
    this.systemTexts.integrity.setText(`INTEGRIDAD - ${Math.round(this.systems.integrity)} %`);
    this.systemTexts.lights.setText(`LUCES - ${Math.round(this.systems.lights)} %`);
    this.drawSystemBar(this.systemBars.energy, 953, 144, this.systems.energy, 0xffd166);
    this.drawSystemBar(this.systemBars.integrity, 953, 194, this.systems.integrity, 0x90e0ef);
    this.drawSystemBar(this.systemBars.lights, 953, 244, this.systems.lights, 0x7df9ff);
  }

  private drawSystemBar(graphics: Phaser.GameObjects.Graphics, x: number, y: number, value: number, color: number): void {
    graphics.clear();
    graphics.fillStyle(0x0a1b2d, 1);
    graphics.fillRoundedRect(x, y, 245, 12, 6);
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(x, y, 245 * (value / 100), 12, 6);
  }

  private maybeTriggerAlert(): void {
    const schedule = [
      { progress: 12, type: 'lights' as const },
      { progress: 30, type: 'energy' as const },
      { progress: 50, type: 'pressure' as const },
      { progress: 70, type: 'lights' as const },
      { progress: 74, type: 'energy' as const },
      { progress: 88, type: 'pressure' as const }
    ];

    if (this.alertIndex >= schedule.length) return;
    const next = schedule[this.alertIndex];
    if (this.progress < next.progress) return;

    this.alertIndex++;
    if (next.type === 'lights') this.createLightsAlert();
    if (next.type === 'energy') this.createEnergyAlert();
    if (next.type === 'pressure') this.createPressureAlert();
  }

  private createAlertShell(title: string, y: number): ActiveAlert {
    AudioService.playSFX('incorrect');
    this.createGuide(title);
    const width = this.cameras.main.width;
    const container = this.add.container(width / 2, y).setDepth(60);
    const bg = this.add.graphics();
    bg.fillStyle(0xeafbff, 0.98);
    bg.fillRoundedRect(-255, -58, 510, 116, 18);
    bg.lineStyle(5, 0xffd166, 1);
    bg.strokeRoundedRect(-255, -58, 510, 116, 18);
    const text = this.add.text(0, -28, title, {
      font: 'bold 29px "Outfit", "Inter", Arial, sans-serif',
      color: '#08324d',
      align: 'center'
    }).setOrigin(0.5);
    container.add([bg, text]);
    return { type: 'lights', container, timeLeft: 4600, solved: false };
  }

  private createLightsAlert(): void {
    this.systems.lights = 35;
    const alert = this.createAlertShell('FALLO EN LAS LUCES', 330);
    alert.type = 'lights';
    const button = this.add.text(0, 28, 'RESTAURAR LUCES', {
      font: 'bold 26px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      backgroundColor: '#008ec4',
      padding: { x: 18, y: 10 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => {
      AudioService.playSFX('correct');
      this.systems.lights = 100;
      this.solveAlert(alert, '✓ LUCES RESTAURADAS');
    });
    alert.container.add(button);
    this.activeAlerts.push(alert);
  }

  private createEnergyAlert(): void {
    const alert = this.createAlertShell('ENERGIA BAJA', this.activeAlerts.length ? 450 : 330);
    alert.type = 'energy';
    alert.timeLeft = 5600;
    const track = this.add.rectangle(0, 30, 300, 18, 0x8ecae6, 1);
    const target = this.add.rectangle(0, 30, 82, 30, 0x7df9ff, 0.38);
    const marker = this.add.rectangle(-140, 30, 18, 42, 0xffd166, 1);
    alert.target = target;
    alert.marker = marker;
    alert.container.add([track, target, marker]);
    this.activeAlerts.push(alert);
  }

  private createPressureAlert(): void {
    const alert = this.createAlertShell('PRESION CRITICA', this.activeAlerts.length ? 450 : 330);
    alert.type = 'pressure';
    alert.timeLeft = 4800;
    const labels = [
      { text: 'VALVULA A', color: '#ff4d6d' },
      { text: 'VALVULA B', color: '#4cc9f0' },
      { text: 'VALVULA C', color: '#ffd166' }
    ];
    const correctIndex = Phaser.Math.Between(0, 2);

    labels.forEach((label, index) => {
      const valve = this.add.text(-160 + index * 160, 28, label.text, {
        font: 'bold 22px "Outfit", "Inter", Arial, sans-serif',
        color: '#ffffff',
        backgroundColor: label.color,
        padding: { x: 12, y: 10 }
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      if (index === correctIndex) {
        this.tweens.add({
          targets: valve,
          scale: 1.12,
          alpha: 0.45,
          duration: 240,
          yoyo: true,
          repeat: -1
        });
      }

      valve.on('pointerdown', () => {
        if (index === correctIndex) {
          AudioService.playSFX('correct');
          this.solveAlert(alert, '✓ PRESION ESTABILIZADA');
        } else {
          this.failAlert(alert);
        }
      });
      alert.container.add(valve);
    });
    this.activeAlerts.push(alert);
  }

  private updateActiveAlerts(delta: number): void {
    this.activeAlerts = this.activeAlerts.filter((alert) => {
      if (alert.solved) return false;
      alert.timeLeft -= delta;

      if (alert.type === 'energy' && alert.marker && alert.target) {
        const markerX = Math.sin(this.time.now / 230) * 140;
        alert.marker.x = markerX;
        if (Math.abs(markerX - alert.target.x) < 44) {
          alert.timeLeft -= delta * 0.75;
          if (alert.timeLeft < 1850) {
            this.systems.energy = 100;
            this.solveAlert(alert, '✓ ENERGIA ESTABILIZADA');
            return false;
          }
        }
      }

      if (alert.timeLeft <= 0) {
        this.failAlert(alert);
        return false;
      }
      return true;
    });
  }

  private solveAlert(alert: ActiveAlert, message: string): void {
    alert.solved = true;
    this.createGuide(message);
    this.updateSystemPanel();
    this.tweens.add({
      targets: alert.container,
      alpha: 0,
      y: alert.container.y - 20,
      duration: 220,
      onComplete: () => alert.container.destroy()
    });
  }

  private failAlert(alert: ActiveAlert): void {
    if (alert.solved) return;
    alert.solved = true;
    alert.container.destroy();
    this.loseHeart();
  }

  private loseHeart(): void {
    AudioService.playSFX('incorrect');
    this.lives--;
    this.systems.integrity = Phaser.Math.Clamp(this.systems.integrity - 22, 0, 100);
    this.heartsText.setText('♥ '.repeat(Math.max(this.lives, 0)).trim() || '💔');
    this.updateSystemPanel();
    this.cameras.main.flash(260, 255, 40, 70);
    this.createGuide('Fallo importante. El submarino perdio resistencia.');

    if (this.lives <= 0) {
      this.showGameOver();
    }
  }

  private showGameOver(): void {
    this.ended = true;
    this.activeAlerts.forEach((alert) => alert.container.destroy());
    this.activeAlerts = [];
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.82).setDepth(90);
    this.add.text(width / 2, height / 2 - 78, 'PERDISTE', {
      font: 'bold 76px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 9
    }).setOrigin(0.5).setDepth(91);
    this.add.text(width / 2, height / 2 + 0, 'El submarino no logro completar el descenso por la Zona Hadal.', {
      font: 'bold 32px "Outfit", "Inter", Arial, sans-serif',
      color: '#eafbff',
      align: 'center',
      wordWrap: { width: 760 }
    }).setOrigin(0.5).setDepth(91);
    this.createOverlayButton(width / 2 - 150, height / 2 + 95, 'REINTENTAR', () => this.scene.restart());
    this.createOverlayButton(width / 2 + 150, height / 2 + 95, 'VOLVER AL MENÚ', () => this.scene.start('PugGuideScene'));
  }

  private reachBottom(): void {
    this.ended = true;
    this.activeAlerts.forEach((alert) => alert.container.destroy());
    this.activeAlerts = [];
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    this.depthText.setText('PROFUNDIDAD OBJETIVO ALCANZADA');
    this.createGuide('Lo conseguimos. Llegamos hasta una de las regiones mas profundas del oceano.');

    const status = this.add.text(width / 2, 88, '✓ SISTEMAS ESTABLES', {
      font: 'bold 34px "Outfit", "Inter", Arial, sans-serif',
      color: '#7df9ff',
      stroke: '#000713',
      strokeThickness: 6
    }).setOrigin(0.5).setDepth(55);

    this.tweens.add({
      targets: this.submarine,
      y: height - 165,
      duration: 1600,
      ease: 'Sine.easeInOut'
    });

    this.time.delayedCall(1400, () => {
      this.showBottomLife();
      this.createGuide('Incluso en estas condiciones extremas, existe vida.');
    });
    this.time.delayedCall(3300, () => {
      status.destroy();
      this.playReturnSequence();
    });
  }

  private showBottomLife(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    for (let i = 0; i < 22; i++) {
      const life = this.add.circle(
        width / 2 - 310 + Phaser.Math.Between(0, 620),
        height - 105 + Phaser.Math.Between(-42, 20),
        Phaser.Math.FloatBetween(4, 10),
        0x7df9ff,
        0.78
      ).setDepth(50);
      this.tweens.add({
        targets: life,
        alpha: 0.16,
        scale: 1.8,
        duration: Phaser.Math.Between(650, 1300),
        yoyo: true,
        repeat: -1
      });
    }
  }

  private playReturnSequence(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const overlay = this.add.container(0, 0).setDepth(85);
    const bg = this.add.graphics();
    const zoneText = this.add.text(width / 2, height / 2 - 52, 'Zona Hadal', {
      font: 'bold 52px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      stroke: '#002a44',
      strokeThickness: 8
    }).setOrigin(0.5);
    const sub = createPugSubmarine(this, width / 2, height / 2 + 112, 86, true);
    sub.setScale(0.78);
    overlay.add([bg, zoneText, sub]);

    const zones = [
      { name: 'Zona Hadal', top: 0x000207, bottom: 0x000000 },
      { name: 'Zona Abisal', top: 0x020817, bottom: 0x000308 },
      { name: 'Zona de Medianoche', top: 0x07172d, bottom: 0x010611 },
      { name: 'Zona Crepuscular', top: 0x0c5f91, bottom: 0x020817 },
      { name: 'Zona de Luz', top: 0x8ed8ff, bottom: 0x035f9d },
      { name: 'Superficie', top: 0xbdefff, bottom: 0x49b6d8 }
    ];
    let index = 0;
    const drawZone = () => {
      const zone = zones[index];
      bg.clear();
      bg.fillGradientStyle(zone.top, zone.top, zone.bottom, zone.bottom, 1);
      bg.fillRect(0, 0, width, height);
      zoneText.setText(zone.name);
      this.tweens.add({
        targets: sub,
        y: height / 2 + 62,
        duration: 420,
        yoyo: true,
        ease: 'Sine.easeInOut'
      });
    };
    drawZone();
    this.time.addEvent({
      delay: 850,
      repeat: zones.length - 2,
      callback: () => {
        index++;
        drawZone();
      }
    });
    this.time.delayedCall(zones.length * 850 + 450, () => this.showGameComplete());
  }

  private showGameComplete(): void {
    StorageService.unlockBadge('pug_hadal');
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const panel = this.add.container(0, 0).setDepth(100);
    const shade = this.add.rectangle(width / 2, height / 2, width, height, 0x003f66, 0.28);
    const box = this.add.graphics();
    box.fillStyle(0xeafbff, 0.98);
    box.fillRoundedRect(width / 2 - 420, height / 2 - 202, 840, 404, 24);
    box.lineStyle(6, 0xffd23a, 1);
    box.strokeRoundedRect(width / 2 - 420, height / 2 - 202, 840, 404, 24);
    const title = this.add.text(width / 2, height / 2 - 132, 'EXPEDICION COMPLETADA', {
      font: 'bold 48px "Outfit", "Inter", Arial, sans-serif',
      color: '#005f99',
      stroke: '#ffffff',
      strokeThickness: 5
    }).setOrigin(0.5);
    const desc = this.add.text(width / 2, height / 2 - 50, 'Has explorado las cinco zonas del oceano.\nInsignia desbloqueada: EXPLORADOR DE LAS PROFUNDIDADES\nINSIGNIAS: 5/5', {
      font: 'bold 28px "Outfit", "Inter", Arial, sans-serif',
      color: '#003f66',
      align: 'center',
      wordWrap: { width: 735 },
      lineSpacing: 8
    }).setOrigin(0.5);
    const finalGuide = this.add.text(width / 2, height / 2 + 128, 'Nuestra expedicion termina aqui, pero todavia queda mucho del oceano por descubrir.', {
      font: 'bold 24px "Outfit", "Inter", Arial, sans-serif',
      color: '#175676',
      align: 'center',
      wordWrap: { width: 720 }
    }).setOrigin(0.5);
    this.drawFinalBadges(width / 2, height / 2 + 58);
    const encyclopedia = this.createFinalButton(width / 2 - 250, height / 2 + 178, 'ENCICLOPEDIA', 'PugEncyclopediaScene');
    const badges = this.createFinalButton(width / 2, height / 2 + 178, 'INSIGNIAS', 'PugBadgesScene');
    const menu = this.createFinalButton(width / 2 + 250, height / 2 + 178, 'VOLVER AL MENÚ', 'PugGuideScene');
    panel.add([shade, box, title, desc, finalGuide, encyclopedia, badges, menu]);
  }

  private drawFinalBadges(centerX: number, y: number): void {
    const colors = [0xffd166, 0x5fa8d3, 0x7df9ff, 0x4361ee, 0xffd23a];
    colors.forEach((color, index) => {
      const badge = this.add.graphics().setDepth(101);
      const x = centerX - 160 + index * 80;
      badge.fillStyle(color, 1);
      badge.fillCircle(x, y, 26);
      badge.lineStyle(4, 0xffffff, 1);
      badge.strokeCircle(x, y, 26);
      badge.fillStyle(0x003f66, 0.35);
      badge.fillCircle(x, y, 14);
      this.tweens.add({
        targets: badge,
        scale: 1.08,
        duration: 650 + index * 70,
        yoyo: true,
        repeat: -1
      });
    });
  }

  private createFinalButton(x: number, y: number, label: string, scene: string): Phaser.GameObjects.Text {
    const button = this.add.text(x, y, label, {
      font: 'bold 21px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      backgroundColor: '#008ec4',
      padding: { x: 16, y: 11 }
    }).setOrigin(0.5).setDepth(101).setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => {
      AudioService.playSFX('click');
      this.scene.start(scene);
    });
    return button;
  }

  private createOverlayButton(x: number, y: number, label: string, callback: () => void): Phaser.GameObjects.Text {
    const button = this.add.text(x, y, label, {
      font: 'bold 28px "Outfit", "Inter", Arial, sans-serif',
      color: '#ffffff',
      backgroundColor: '#008ec4',
      padding: { x: 18, y: 10 }
    }).setOrigin(0.5).setDepth(91).setInteractive({ useHandCursor: true });
    button.on('pointerdown', () => {
      AudioService.playSFX('click');
      callback();
    });
    return button;
  }

  private createGuide(message: string): void {
    const height = this.cameras.main.height;
    const guide = this.add.image(88, height - 84, 'pug_guide').setDepth(45);
    guide.setDisplaySize(118, 118);
    if (this.guideText) this.guideText.destroy();
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
