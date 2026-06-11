export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.add.text(400, 200, 'O MEU JOGO', {
      fontSize: '48px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 300, 'Prima ENTER para começar', {
      fontSize: '24px',
      fill: '#aaaaaa'
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start('LevelSelectScene');
    });
  }
}