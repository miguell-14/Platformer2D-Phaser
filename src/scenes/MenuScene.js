import { locale } from '../locale.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    this.cameras.main.fadeIn(300, 0, 0, 0);

    // Background
    this.add.image(0, 0, 'bg_sky').setOrigin(0, 0).setDisplaySize(width, height);
    this.add.tileSprite(0, height, width, 320, 'bg_mountains').setOrigin(0, 1);
    this.add.tileSprite(0, height, width, 320, 'bg_front').setOrigin(0, 1);

    this.add.text(400, 180, locale.t('title'), {
      fontSize: '48px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(400, 300, locale.t('pressStart'), {
      fontSize: '24px',
      fill: '#aaaaaa',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-ENTER', () => {
      this.cameras.main.fade(400, 0, 0, 0, false, (cam, progress) => {
        if (progress === 1) this.scene.start('LevelSelectScene');
      });
    });
  }
}
