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
    this.load.spritesheet('player_attack1', 'assets/images/player/Dude_Monster_Attack1_4.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('player_walkattack', 'assets/images/player/Dude_Monster_Walk+Attack_6.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('player_hurt', 'assets/images/player/Dude_Monster_Hurt_4.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('player_death', 'assets/images/player/Dude_Monster_Death_8.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('player_climb', 'assets/images/player/Dude_Monster_Climb_4.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('player_push', 'assets/images/player/Dude_Monster_Push_6.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('dust', 'assets/images/player/Walk_Run_Push_Dust_6.png', { frameWidth: 32, frameHeight: 32 });

    // Tilemap
    this.load.tilemapTiledJSON('level1', 'assets/level1.json');
    this.load.tilemapTiledJSON('level2', 'assets/level2.json');
    this.load.image('tiles', 'assets/images/tiles/Tileset-extruded.png');
    this.load.image('tiles-plain', 'assets/images/tiles/Tileset.png');
    this.load.image('trees', 'assets/images/tiles/Trees.png');
    this.load.image('dungeon-tiles', 'assets/images/tiles/Dungeon-tile-set.png');
    this.load.spritesheet('coins', 'assets/images/tiles/coins.png', { frameWidth: 16, frameHeight: 16 });

    // Flags
    this.load.image('flag-en', 'assets/images/flags/gb.png');
    this.load.image('flag-pt', 'assets/images/flags/pt.png');
    this.load.image('flag-es', 'assets/images/flags/es.png');

    // Audio
    this.load.audio('menu-music', 'assets/audio/main-menu.mp3');
    this.load.audio('level1-theme', 'assets/audio/level1-theme.mp3');
    this.load.audio('death-sfx', 'assets/audio/death-soudeffect.mp3');
    this.load.audio('coin-sfx', 'assets/audio/coin-soundeffect.mp3');

    // Logo
    this.load.image('logo', 'assets/images/logotipo.png');

    // Backgrounds
    this.load.image('bg_sky', 'assets/images/tiles/CloudsBack.png');
    this.load.image('bg_mountains', 'assets/images/tiles/BGBack.png');
    this.load.image('bg_front', 'assets/images/tiles/BGFront.png');
    this.load.image('clouds_front', 'assets/images/tiles/CloudsFront.png');
  }

  create() {
    this.scene.start('MenuScene');
  }

  
}