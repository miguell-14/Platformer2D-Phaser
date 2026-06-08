export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Plataforma base
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 450, null)
      .setDisplaySize(800, 20)
      .setVisible(false)
      .refreshBody();

    // Jogador
    this.player = this.physics.add.sprite(100, 380, 'player_idle');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.setScale(2);

    // Animações
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player_idle', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('player_walk', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('player_jump', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: 0
    });

    // Colisão jogador com plataforma
    this.physics.add.collider(this.player, this.platforms);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    const onGround = this.player.body.blocked.down;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
      this.player.setFlipX(true);
      if (onGround) this.player.anims.play('walk', true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
      this.player.setFlipX(false);
      if (onGround) this.player.anims.play('walk', true);
    } else {
      this.player.setVelocityX(0);
      if (onGround) this.player.anims.play('idle', true);
    }

    if (this.cursors.up.isDown && onGround) {
      this.player.setVelocityY(-400);
      this.player.anims.play('jump', true);
    }
  }
}