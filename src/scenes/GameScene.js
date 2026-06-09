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
    this.player.body.setSize(14, 28);
    this.player.body.setOffset(9, 4);

    // Dust effect
    this.dustEffect = this.add.sprite(0, 0, 'dust');
    this.dustEffect.setScale(2);
    this.dustEffect.setVisible(false);
    this.dustEffect.on('animationcomplete', () => {
      this.dustEffect.setVisible(false);
    });

    // Colisão
    this.physics.add.collider(this.player, groundLayer, null, (player, tile) => {
      if (tile.properties && tile.properties.oneWay) {
        return player.body.velocity.y > 0;
      }
      if (tile.properties && tile.properties.collides) {
        return true;
      }
      return false;
    });

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
      key: 'run',
      frames: this.anims.generateFrameNumbers('player_run', { start: 0, end: 5 }),
      frameRate: 14,
      repeat: -1
    });
    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('player_jump', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: 0
    });
    this.anims.create({
      key: 'fall',
      frames: this.anims.generateFrameNumbers('player_jump', { start: 4, end: 7 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'attack',
      frames: this.anims.generateFrameNumbers('player_attack1', { start: 0, end: 3 }),
      frameRate: 12,
      repeat: 0
    });
    this.anims.create({
      key: 'walkattack',
      frames: this.anims.generateFrameNumbers('player_walkattack', { start: 0, end: 5 }),
      frameRate: 12,
      repeat: 0
    });
    this.anims.create({
      key: 'hurt',
      frames: this.anims.generateFrameNumbers('player_hurt', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: 0
    });
    this.anims.create({
      key: 'death',
      frames: this.anims.generateFrameNumbers('player_death', { start: 0, end: 7 }),
      frameRate: 10,
      repeat: 0
    });
    this.anims.create({
      key: 'dust',
      frames: this.anims.generateFrameNumbers('dust', { start: 0, end: 5 }),
      frameRate: 16,
      repeat: -1  // repete enquanto o dash durar
    });

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.dashKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

    // Estado do jogador
    this.isJumping = false;
    this.jumpTimer = 0;
    this.jumpMaxTime = 350;
    this.isAttacking = false;
    this.wasRunning = false;
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashDuration = 200;
    this.dashSpeed = 800;
    this.dashCooldown = 0;
    this.dashCooldownTime = 800;

    // Evento fim de animação
    this.player.on('animationcomplete', (anim) => {
      if (anim.key === 'attack' || anim.key === 'walkattack') {
        this.isAttacking = false;
      }
    });
  }

  update() {
    const onGround = this.player.body.blocked.down;
    const isRunning = this.shiftKey.isDown;
    const speed = isRunning ? 320 : 200;

    // Cooldown do dash
    if (this.dashCooldown > 0) {
      this.dashCooldown -= this.game.loop.delta;
    }

    // Dash
    if (Phaser.Input.Keyboard.JustDown(this.dashKey) && onGround && !this.isDashing && this.dashCooldown <= 0) {
      this.isDashing = true;
      this.dashTimer = 0;
      this.dashCooldown = this.dashCooldownTime;
      const direction = this.player.flipX ? -1 : 1;
      this.player.setVelocityX(this.dashSpeed * direction);
      this.player.anims.play('run', true);
      this.player.setAlpha(0.6);
      this.dustEffect.setVisible(true);
      this.dustEffect.setPosition(this.player.x, this.player.y + 10);
      this.dustEffect.setFlipX(this.player.flipX);
      this.dustEffect.anims.play('dust', true);
    }

    // Durante o dash
    if (this.isDashing) {
      this.dustEffect.setPosition(this.player.x, this.player.y + 10);
      this.dashTimer += this.game.loop.delta;
      if (this.dashTimer >= this.dashDuration) {
        this.isDashing = false;
        this.player.setAlpha(1);
        this.dustEffect.setVisible(false);
        this.dustEffect.anims.stop();
      }
    }

    // Ataque
    if (Phaser.Input.Keyboard.JustDown(this.attackKey) && !this.isAttacking && !this.isDashing) {
      this.isAttacking = true;
      if (this.cursors.left.isDown || this.cursors.right.isDown) {
        this.player.anims.play('walkattack', true);
      } else {
        this.player.anims.play('attack', true);
      }
    }

    // Salto
    if (this.cursors.up.isDown) {
      if (onGround && !this.isJumping) {
        this.player.setVelocityY(-700);
        this.wasRunning = isRunning;
        this.isJumping = true;
        this.jumpTimer = 0;
        if (!this.isAttacking) this.player.anims.play('jump', true);
      } else if (this.isJumping && this.jumpTimer < this.jumpMaxTime) {
        const progress = this.jumpTimer / this.jumpMaxTime;
        const jumpForce = Phaser.Math.Linear(-400, -100, progress);
        this.player.setVelocityY(jumpForce);
        this.jumpTimer += this.game.loop.delta;
      }
    } else {
      if (this.isJumping) {
        this.player.setVelocityY(this.player.body.velocity.y * 0.5);
      }
      this.isJumping = false;
    }

    // Movimento horizontal
    if (!this.isDashing) {
      if (this.cursors.left.isDown) {
        const airSpeed = this.wasRunning ? 320 : 200;
        this.player.setVelocityX(onGround ? -speed : -airSpeed);
        this.player.setFlipX(true);
        if (onGround && !this.isAttacking) {
          this.player.anims.play(isRunning ? 'run' : 'walk', true);
        }
      } else if (this.cursors.right.isDown) {
        const airSpeed = this.wasRunning ? 320 : 200;
        this.player.setVelocityX(onGround ? speed : airSpeed);
        this.player.setFlipX(false);
        if (onGround && !this.isAttacking) {
          this.player.anims.play(isRunning ? 'run' : 'walk', true);
        }
      } else {
        if (onGround) {
          this.player.setVelocityX(0);
          this.wasRunning = false;
        } else {
          this.player.setVelocityX(this.player.body.velocity.x * 0.92);
        }
        if (onGround && !this.isAttacking) {
          this.player.anims.play('idle', true);
        }
      }
    }

    // Animação de queda
    if (!onGround && !this.isAttacking && !this.isDashing) {
      if (this.player.body.velocity.y > 100) {
        this.player.anims.play('fall', true);
      }
    }
  }
}