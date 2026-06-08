export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create() {
    this.add.text(400, 225, 'Game Over', {
      fontSize: '48px',
      fill: '#ff0000'
    }).setOrigin(0.5);
  }
}