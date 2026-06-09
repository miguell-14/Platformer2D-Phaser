export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Fundo
    this.add.rectangle(400, 225, 800, 450, 0x1a1a2e);

    // Plataformas
    const ground = this.add.rectangle(400, 430, 800, 20, 0x4a9eff);
    this.physics.add.existing(ground, true);

    const p1 = this.add.rectangle(150, 330, 180, 20, 0x4a9eff);
    this.physics.add.existing(p1, true);

    const p2 = this.add.rectangle(450, 250, 180, 20, 0x4a9eff);
    this.physics.add.existing(p2, true);

    const p3 = this.add.rectangle(200, 160, 180, 20, 0x4a9eff);
    this.physics.add.existing(p3, true);

    // Jogador
    this.player = this.physics.add.sprite(100, 380, 'player_idle');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.setScale(2);
    this.player.body.setSize(20, 26);
    this.player.body.setOffset(6, 6);
    this.isJumping = false;
    this.jumpTimer = 0;
    this.jumpMaxTime = 200;

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

    // Colisões
    this.physics.add.collider(this.player, ground);
    this.physics.add.collider(this.player, p1);
    this.physics.add.collider(this.player, p2);
    this.physics.add.collider(this.player, p3);

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    const onGround = this.player.body.blocked.down;

    if (this.cursors.up.isDown) {
      if (onGround && !this.isJumping) {
        this.player.setVelocityY(-300); // salto mínimo mais pequeno
        this.isJumping = true;
        this.jumpTimer = 0;
        this.player.anims.play('jump', true);
      } else if (this.isJumping && this.jumpTimer < this.jumpMaxTime) {
        this.player.setVelocityY(-500); // salto máximo mais pequeno
        this.jumpTimer += this.game.loop.delta;
      }
    } else {
      this.isJumping = false;
    }

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
  }
}