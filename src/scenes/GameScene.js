export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Backgrounds
    this.bgSky = this.add.image(0, 0, 'bg_sky').setOrigin(0, 0).setScrollFactor(0);
    this.bgSky.setDisplaySize(width, height);

    this.bgMountains = this.add.image(0, 0, 'bg_mountains').setOrigin(0, 1).setScrollFactor(0.1);
    this.bgMountains.y = height;

    this.bgFront = this.add.image(0, 0, 'bg_front').setOrigin(0, 1).setScrollFactor(0.2);
    this.bgFront.y = height;

    // Tilemap
    const map = this.make.tilemap({ key: 'level1' });
    const tileset = map.addTilesetImage('Tileset', 'tiles', 16, 16, 1, 2);
    const groundLayer = map.createLayer('Ground', tileset, 0, 0);
    groundLayer.setScale(2);
    groundLayer.setCollisionByProperty({ collides: true });

    // Bounds
    this.physics.world.setBounds(0, 0, map.widthInPixels * 2, map.heightInPixels * 2);
    this.cameras.main.setBounds(0, 0, map.widthInPixels * 2, map.heightInPixels * 2);

    // Jogador
    this.player = this.physics.add.sprite(100, 200, 'player_idle');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.setScale(2);
    this.player.body.setSize(20, 26);
    this.player.body.setOffset(6, 6);
    this.player.setTexture('player_idle');

    
    // Colisão
    this.physics.add.collider(this.player, groundLayer);

    // Câmara
    this.cameras.main.startFollow(this.player);

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

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.isJumping = false;
    this.jumpTimer = 0;
    this.jumpMaxTime = 200;
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