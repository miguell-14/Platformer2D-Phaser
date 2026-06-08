export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.add.text(400, 225, 'GameScene - em construção', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }
}