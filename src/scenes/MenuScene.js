import { locale } from '../locale.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    // Inicializa o menu principal
    super({ key: 'MenuScene' });
  }

  create() {
    // Cria o ecra de menu com musica, fundo e animacoes do personagem
    const width = this.scale.width;
    const height = this.scale.height;
    const cx = width / 2;
    this.cameras.main.fadeIn(600, 0, 0, 0);

    // Música
    const existing = this.sound.get('menu-music');
    if (existing && existing.isPlaying && existing.volume >= 0.5) {
      this.menuMusic = existing;
    } else {
      if (existing) existing.destroy();
      this.menuMusic = this.sound.add('menu-music', { loop: true, volume: 0 });
      this.menuMusic.play();
      this.tweens.add({ targets: this.menuMusic, volume: 0.6, duration: 1500, ease: 'Linear' });
    }

    // Background
    this.add.image(0, 0, 'bg_sky').setOrigin(0, 0).setDisplaySize(width, height);
    this.bgMountains = this.add.tileSprite(0, height, width, 320, 'bg_mountains').setOrigin(0, 1);
    this.bgFront = this.add.tileSprite(0, height, width, 320, 'bg_front').setOrigin(0, 1);

    // Animações
    if (!this.anims.exists('idle')) {
      this.anims.create({
        key: 'idle',
        frames: this.anims.generateFrameNumbers('player_idle', { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1
      });
    }
    if (!this.anims.exists('walk')) {
      this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('player_walk', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
      });
    }

    // Personagem
    const groundY = height - 62;
    this.hero = this.add.sprite(-40, groundY, 'player_idle')
      .setScale(3.5)
      .setOrigin(0.5, 1)
      .setDepth(5);

    this.hero.play('walk');

    this.tweens.add({
      targets: this.hero,
      x: 190,
      duration: 1800,
      ease: 'Linear',
      onComplete: () => {
        this.hero.play('idle');
      }
    });

    // Logo
    const logo = this.add.image(cx, -60, 'logo')
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(10)
      .setScale(0.5700);

    this.tweens.add({
      targets: logo,
      y: 175,
      alpha: 1,
      duration: 900,
      delay: 300,
      ease: 'Back.Out'
    });

    // Texto
    const pressStart = this.add.text(cx, 330, locale.t('pressStart'), {
      fontSize: '20px',
      fill: '#aaddff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setAlpha(0).setDepth(10);

    this.tweens.add({
      targets: pressStart,
      alpha: 1,
      duration: 500,
      delay: 1500,
      onComplete: () => {
        this.tweens.add({
          targets: pressStart,
          alpha: 0,
          duration: 700,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.InOut'
        });
      }
    });

    // Input
    this.input.keyboard.once('keydown-ENTER', () => {
      this.cameras.main.fade(400, 0, 0, 0, false, (cam, progress) => {
        if (progress === 1) this.scene.start('LevelSelectScene');
      });
    });
  }

  update() {
    // Atualiza o parallax do fundo
    // Parallax
    this.bgMountains.tilePositionX += 0.2;
    this.bgFront.tilePositionX += 0.4;
  }
}
