export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Barra de carregamento
    const bar = this.add.rectangle(400, 225, 0, 20, 0xffffff);
    this.load.on('progress', (value) => {
      bar.width = 800 * value;
    });

    // Sprites do jogador
    this.load.spritesheet('player_idle', 'assets/images/player/Dude_Monster_Idle_4.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('player_walk', 'assets/images/player/Dude_Monster_Walk_6.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('player_run', 'assets/images/player/Dude_Monster_Run_6.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('player_jump', 'assets/images/player/Dude_Monster_Jump_8.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('player_death', 'assets/images/player/Dude_Monster_Death_8.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('player_hurt', 'assets/images/player/Dude_Monster_Hurt_4.png', { frameWidth: 32, frameHeight: 32 });
  }

  create() {
    this.scene.start('MenuScene');
  }
}