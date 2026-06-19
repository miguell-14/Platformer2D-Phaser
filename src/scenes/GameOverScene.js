import { locale } from '../locale.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    // Inicializa a cena de game over
    super({ key: 'GameOverScene' });
  }

  create() {
    // Cria o ecra de game over com botao para voltar ao menu
    const cx = 400, cy = 225;

    // Fundo
    this.add.rectangle(cx, cy, 800, 450, 0x000000, 1);

    // Título
    this.add.text(cx, cy - 60, 'Game Over', {
      fontSize: '52px',
      fill: '#ff4444',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Botão menu
    const menuBtn = this.add.text(cx, cy + 40, locale.t('mainMenu'), {
      fontSize: '22px',
      fill: '#ffffff',
      backgroundColor: '#2a2a44',
      padding: { x: 28, y: 12 }
    }).setOrigin(0.5).setInteractive();

    menuBtn.on('pointerover', () => menuBtn.setStyle({ backgroundColor: '#3a3a66' }));
    menuBtn.on('pointerout', () => menuBtn.setStyle({ backgroundColor: '#2a2a44' }));
    menuBtn.on('pointerdown', () => {
      localStorage.removeItem('level1');
      localStorage.removeItem('level2');
      this.cameras.main.fade(400, 0, 0, 0, false, (cam, progress) => {
        if (progress === 1) this.scene.start('MenuScene');
      });
    });

    // Entrada
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }
}
