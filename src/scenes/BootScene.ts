import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {}

  create(): void {
    this.showDeviceSelection();
  }

  private showDeviceSelection(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    const title = this.add.text(width / 2, height / 2 - 80, '¿En qué dispositivo estás jugando?', {
      fontSize: '32px', color: '#ffffff', fontFamily: 'Arial', align: 'center'
    }).setOrigin(0.5);

    const btnPC = this.add.text(width / 2 - 150, height / 2 + 40, '[ Computadora ]', {
      fontSize: '28px', color: '#00ff00', fontFamily: 'Arial'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const btnMobile = this.add.text(width / 2 + 150, height / 2 + 40, '[ Celular ]', {
      fontSize: '28px', color: '#00ff00', fontFamily: 'Arial'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btnPC.on('pointerover', () => btnPC.setColor('#ffffff'));
    btnPC.on('pointerout', () => btnPC.setColor('#00ff00'));
    btnMobile.on('pointerover', () => btnMobile.setColor('#ffffff'));
    btnMobile.on('pointerout', () => btnMobile.setColor('#00ff00'));

    btnPC.on('pointerdown', () => {
      this.registry.set('isMobile', false);
      title.destroy(); btnPC.destroy(); btnMobile.destroy();
      this.showControlSelection(false);
    });

    btnMobile.on('pointerdown', () => {
      this.registry.set('isMobile', true);
      title.destroy(); btnPC.destroy(); btnMobile.destroy();
      
      if (!this.scale.isFullscreen && this.sys.game.device.fullscreen.available) {
          this.scale.startFullscreen();
      }
      this.showControlSelection(true);
    });
  }

  private showControlSelection(isMobile: boolean): void {
    const width = this.scale.width;
    const height = this.scale.height;

    const title = this.add.text(width / 2, height / 2 - 80, '¿Qué control prefieres usar?', {
      fontSize: '32px', color: '#ffffff', fontFamily: 'Arial', align: 'center'
    }).setOrigin(0.5);

    const option1Text = isMobile ? '[ Botones en Pantalla ]' : '[ Teclado ]';
    const option2Text = isMobile ? '[ Tocar y Arrastrar ]' : '[ Ratón ]';
    
    const control1Value = isMobile ? 'virtual_buttons' : 'keyboard';
    const control2Value = 'pointer';

    const btn1 = this.add.text(width / 2 - 180, height / 2 + 40, option1Text, {
      fontSize: '24px', color: '#00e5ff', fontFamily: 'Arial'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const btn2 = this.add.text(width / 2 + 180, height / 2 + 40, option2Text, {
      fontSize: '24px', color: '#00e5ff', fontFamily: 'Arial'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn1.on('pointerover', () => btn1.setColor('#ffffff'));
    btn1.on('pointerout', () => btn1.setColor('#00e5ff'));
    btn2.on('pointerover', () => btn2.setColor('#ffffff'));
    btn2.on('pointerout', () => btn2.setColor('#00e5ff'));

    const finishSelection = (type: string) => {
      this.registry.set('controlType', type);
      title.destroy(); btn1.destroy(); btn2.destroy();
      
      if (isMobile) {
        this.askForRotation();
      } else {
        this.scene.start('PreloadScene');
      }
    };

    btn1.on('pointerdown', () => finishSelection(control1Value));
    btn2.on('pointerdown', () => finishSelection(control2Value));
  }

  private askForRotation(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    this.add.text(width / 2, height / 2, 'Da la vuelta a tu celular\n(Ponlo en horizontal)', {
      fontSize: '36px', color: '#ffffff', fontFamily: 'Arial', align: 'center'
    }).setOrigin(0.5);

    this.scale.on('orientationchange', this.handleOrientationChange, this);
    if (this.scale.isLandscape) {
       this.handleOrientationChange();
    }
  }

  private handleOrientationChange(): void {
    if (this.scale.isLandscape) {
      this.scale.off('orientationchange', this.handleOrientationChange, this);
      this.time.delayedCall(1000, () => {
        this.scene.start('PreloadScene');
      });
    }
  }
}
