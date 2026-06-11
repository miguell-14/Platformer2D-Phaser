export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    this.cameras.main.fadeIn(700, 0, 0, 0);

    // Backgrounds
    this.bgSky = this.add.image(0, 0, 'bg_sky').setOrigin(0, 0).setScrollFactor(0);
    this.bgSky.setDisplaySize(width, height);

    this.bgMountains = this.add.tileSprite(0, height, width, 320, 'bg_mountains')
      .setOrigin(0, 1).setScrollFactor(0);

    this.bgFront = this.add.tileSprite(0, height, width, 320, 'bg_front')
      .setOrigin(0, 1).setScrollFactor(0);

    // Tutorial hints (added before tile layers so they render behind them)
    this.setupTutorialHints();

    // Tilemap
    const map = this.make.tilemap({ key: 'level1' });
    const tileset = map.addTilesetImage('Tileset', 'tiles', 16, 16, 1, 2);
    const treesTileset = map.addTilesetImage('Trees', 'trees', 16, 16);

    const decorativeRocksLayer = map.createLayer('DecorativeRocks', tileset, 0, 0);
    decorativeRocksLayer.setScale(2);

    if (map.getLayer('Trees')) {
      map.createLayer('Trees', treesTileset, 0, 0).setScale(2);
    }

    
    const groundLayer = map.createLayer('Ground', tileset, 0, 0);
    groundLayer.setScale(2);
    groundLayer.setCollisionByProperty({ collides: true });
    
    const backgroundLayer = map.createLayer('Background', [tileset, treesTileset], 0, 0);
    backgroundLayer.setScale(2);


    // Bounds
    this.physics.world.setBounds(0, 0, map.widthInPixels * 2, map.heightInPixels * 2);
    this.physics.world.setBoundsCollision(true, true, true, false);
    this.cameras.main.setBounds(0, 0, map.widthInPixels * 2, map.heightInPixels * 2);

    // Jogador
    this.player = this.physics.add.sprite(0, 512, 'player_idle');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.setScale(2);
    this.player.body.setSize(14, 28);
    this.player.body.setOffset(9, 4);

    // Objeto de entrada da caverna
    const objectLayer = map.getObjectLayer('Objects');
    const caveEntry = objectLayer.objects.find(o => o.name === 'caveEntry');

    this.caveZone = this.add.zone(
      caveEntry.x * 2,
      caveEntry.y * 2,
      caveEntry.width * 2,
      caveEntry.height * 2
    );
    this.physics.world.enable(this.caveZone, Phaser.Physics.Arcade.STATIC_BODY);

    this.physics.add.overlap(this.player, this.caveZone, () => {
      if (!this.enteringCave) {
        this.enteringCave = true;
        this.startCaveEntry();
      }
    });

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
      return true;
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
    this.jumpMaxTime = 100;
    this.isAttacking = false;
    this.wasRunning = false;
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashDuration = 200;
    this.dashSpeed = 800;
    this.dashCooldown = 0;
    this.dashCooldownTime = 800;
    this.enteringCave = false;
    this.isDead = false;
    this.isSpawning = true;
    this.attackEnabled = false;
    this.dashEnabled = false;

    this.music = this.sound.add('level1-theme', { loop: true, volume: 0.5 });
    this.deathSfx = this.sound.add('death-sfx');

    this.spawnPlayer();

    // Evento fim de animação
    this.player.on('animationcomplete', (anim) => {
      if (anim.key === 'attack' || anim.key === 'walkattack') {
        this.isAttacking = false;
      }
    });
  }

  spawnPlayer() {
    this.input.keyboard.enabled = false;
    this.player.setCollideWorldBounds(false);
    this.player.setPosition(0, 512);
    this.player.setAlpha(0);
    this.player.setVelocityX(60);
    this.player.anims.play('walk', true);
    this.music.play();

    this.tweens.add({
      targets: this.player,
      alpha: 1,
      duration: 1200,
      ease: 'Power1',
      onComplete: () => {
        this.player.setCollideWorldBounds(true);
        this.time.delayedCall(400, () => {
          this.isSpawning = false;
          this.player.setVelocityX(0);
          this.player.anims.play('idle', true);
          this.input.keyboard.enabled = true;
          const moverHint = this.tutorialTriggers[0];
          moverHint.shown = true;
          this.showHint(moverHint.container);
        });
      }
    });
  }

  showHint(container) {
    this.tweens.add({
      targets: container,
      alpha: 1,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        this.tweens.add({
          targets: container,
          y: container.y - 8,
          duration: 1200,
          yoyo: true,
          repeat: 2,
          ease: 'Sine.easeInOut',
        });
        this.time.delayedCall(4200, () => {
          this.tweens.add({
            targets: container,
            alpha: 0,
            duration: 600,
            ease: 'Power2',
          });
        });
      }
    });
  }

  setupTutorialHints() {
    const hints = [
      { triggerX: 99999, x: 256,  y: 416, keys: ['←', '→'],   label: 'Mover' },
      { triggerX: 750,   x: 864,  y: 416, keys: ['↑'],         label: 'Saltar' },
      { triggerX: 3350, x: 3488, y: 224, keys: ['⇧', '←/→'], label: 'Correr' },
      { triggerX: 1400, x: 1504, y: 352, keys: ['↑'],         label: 'Segura p/ subir mais' },
    ];

    this.tutorialTriggers = hints.map(h => {
      const container = this.createKeyPrompt(h.x, h.y, h.keys, h.label);
      return { triggerX: h.triggerX, container, shown: false };
    });
  }

  createKeyPrompt(x, y, keys, label) {
    const container = this.add.container(x, y);
    const kw = 40, kh = 36, gap = 8;
    const totalW = keys.length * kw + (keys.length - 1) * gap;

    const panelPx = 16, panelPy = 10;
    const panelW = Math.max(totalW, label.length * 10) + panelPx * 2;
    const panelH = kh + 22 + panelPy * 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.45);
    panel.fillRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 10);
    container.add(panel);

    const startX = -(totalW / 2) + kw / 2;
    keys.forEach((label, i) => {
      const kx = startX + i * (kw + gap);
      const ky = -10;

      const shadow = this.add.graphics();
      shadow.fillStyle(0x333333, 0.8);
      shadow.fillRoundedRect(kx - kw / 2 + 2, ky - kh / 2 + 4, kw, kh, 5);

      const cap = this.add.graphics();
      cap.fillStyle(0xeeeeee, 1);
      cap.fillRoundedRect(kx - kw / 2, ky - kh / 2, kw, kh, 5);
      cap.lineStyle(1.5, 0xaaaaaa, 1);
      cap.strokeRoundedRect(kx - kw / 2, ky - kh / 2, kw, kh, 5);

      const fontSize = label.length > 4 ? '9px' : label.length > 2 ? '11px' : '15px';
      const keyText = this.add.text(kx, ky, label, {
        fontFamily: 'monospace',
        fontSize,
        color: '#222222',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      container.add([shadow, cap, keyText]);
    });

    const labelText = this.add.text(0, kh / 2 + 5, label, {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    container.add(labelText);

    container.setAlpha(0);
    return container;
  }

  triggerDeath() {
    this.isDead = true;
    this.input.keyboard.enabled = false;
    this.player.setVelocityX(0);
    this.music.stop();
    this.deathSfx.play();
    this.player.anims.play('death', true);
    this.player.once('animationcomplete', () => {
      this.cameras.main.fade(700, 0, 0, 0, false, (cam, progress) => {
        if (progress === 1) this.scene.restart();
      });
    });
  }

  startCaveEntry() {
    this.cameras.main.stopFollow();
    this.input.keyboard.enabled = false;

    this.player.setVelocityX(70);
    this.player.setFlipX(false);
    this.player.anims.play('walk', true);

    this.tweens.add({
      targets: this.player,
      alpha: 0,
      duration: 3250,
      delay: 500,
      onComplete: () => {
        this.cameras.main.fade(800, 0, 0, 0, false, (camera, progress) => {
          if (progress === 1) {
            this.scene.start('GameOverScene');
          }
        });
      }
    });
  }

  update() {
    const onGround = this.player.body.blocked.down;
    const isRunning = this.shiftKey.isDown;
    const speed = isRunning ? 320 : 200;

    this.bgMountains.tilePositionX = this.cameras.main.scrollX * 0.1;
    this.bgFront.tilePositionX = this.cameras.main.scrollX * 0.2;

    if (this.enteringCave || this.isSpawning || this.isDead) return;

    if (this.player.y > 680) {
      this.triggerDeath();
      return;
    }

    // Tutorial hints
    this.tutorialTriggers.forEach(hint => {
      if (!hint.shown && this.player.x > hint.triggerX) {
        hint.shown = true;
        this.showHint(hint.container);
      }
    });

    if (this.dashEnabled) {
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
    }

    if (this.attackEnabled) {
      if (Phaser.Input.Keyboard.JustDown(this.attackKey) && !this.isAttacking && !this.isDashing) {
        this.isAttacking = true;
        if (this.cursors.left.isDown || this.cursors.right.isDown) {
          this.player.anims.play('walkattack', true);
        } else {
          this.player.anims.play('attack', true);
        }
      }
    }

    // Salto
    if (this.cursors.up.isDown) {
      if (onGround && !this.isJumping) {
        this.player.setVelocityY(-350);
        this.wasRunning = isRunning;
        this.isJumping = true;
        this.jumpTimer = 0;
        if (!this.isAttacking) this.player.anims.play('jump', true);
      } else if (this.isJumping && this.jumpTimer < this.jumpMaxTime) {
        this.player.body.setGravityY(-900);
        this.jumpTimer += this.game.loop.delta;
      } else if (this.isJumping) {
        this.player.body.setGravityY(0);
      }
    } else {
      if (this.isJumping) {
        this.player.body.setGravityY(0);
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