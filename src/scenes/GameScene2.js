import { locale } from '../locale.js';

export default class GameScene2 extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene2' });
  }

  init(data) {
    this.lives = data.lives !== undefined ? data.lives : 3;
    this.isFirstEntry = data.lives === undefined;
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    if (!this.isFirstEntry) this.cameras.main.fadeIn(700, 0, 0, 0);

    // Backgrounds
    this.bgSky = this.add.image(0, 0, 'bg_sky').setOrigin(0, 0).setScrollFactor(0);
    this.bgSky.setDisplaySize(width, height);

    this.bgMountains = this.add.tileSprite(0, height, width, 320, 'bg_mountains')
      .setOrigin(0, 1).setScrollFactor(0);

    this.bgFront = this.add.tileSprite(0, height, width, 320, 'bg_front')
      .setOrigin(0, 1).setScrollFactor(0);

    // Tilemap
    const map = this.make.tilemap({ key: 'level2' });
    const tileset = map.addTilesetImage('Tileset', 'tiles-plain', 16, 16);
    const treesTileset = map.addTilesetImage('Trees', 'trees', 16, 16);
    const coinsTileset = map.addTilesetImage('Coins', 'coins', 16, 16);
    const dungeonTileset = map.addTilesetImage('DungeonTileset', 'dungeon-tiles', 16, 16);

    const allTilesets = [tileset, treesTileset, coinsTileset, dungeonTileset];

    const backgroundLayer = map.createLayer('Background', allTilesets, 0, 0);
    backgroundLayer.setScale(2);

    const decorativeRocksLayer = map.createLayer('DecorativeRocks', allTilesets, 0, 0);
    decorativeRocksLayer.setScale(2);

    const groundLayer = map.createLayer('Ground', allTilesets, 0, 0);
    groundLayer.setScale(2);
    groundLayer.setCollisionByProperty({ collides: true });

    // Bounds
    this.physics.world.setBounds(0, 0, map.widthInPixels * 2, map.heightInPixels * 2);
    this.physics.world.setBoundsCollision(true, true, true, false);
    this.cameras.main.setBounds(0, 0, map.widthInPixels * 2, map.heightInPixels * 2);

    // Jogador
    this.player = this.physics.add.sprite(0, 512, 'player_idle').setAlpha(0);
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.setScale(2);
    this.player.body.setSize(14, 28);
    this.player.body.setOffset(9, 4);

    // Objeto de saída
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
      repeat: -1
    });
    this.anims.create({
      key: 'coin-spin',
      frames: this.anims.generateFrameNumbers('coins', { start: 48, end: 59 }),
      frameRate: 12,
      repeat: -1
    });
    this.anims.create({
      key: 'climb',
      frames: this.anims.generateFrameNumbers('player_climb', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });

    // Moedas
    this.coins = this.physics.add.staticGroup();
    objectLayer.objects.filter(o => o.name === 'coin').forEach(coinObj => {
      const coin = this.coins.create(coinObj.x * 2 + 16, coinObj.y * 2 - 16, 'coins');
      coin.setScale(2);
      coin.refreshBody();
      coin.anims.play('coin-spin');
    });

    // Escadas
    this.ladderZones = objectLayer.objects
      .filter(o => o.name === 'ladder')
      .map(obj => this.add.zone(
        obj.x * 2 + obj.width,
        obj.y * 2 + obj.height,
        obj.width * 2,
        obj.height * 2
      ));

    // Lives UI
    this.add.image(20, 16, 'player_idle', 0)
      .setScrollFactor(0).setDepth(10).setDisplaySize(32, 32).setOrigin(0, 0);
    this.livesText = this.add.text(60, 24, 'x' + this.lives, {
      fontSize: '16px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setScrollFactor(0).setDepth(10);

    // Coins UI
    this.coinCount = 0;
    this.add.image(20, 58, 'coins', 48)
      .setScrollFactor(0).setDepth(10).setScale(2).setOrigin(0, 0);
    this.coinText = this.add.text(60, 66, '0', {
      fontSize: '16px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setScrollFactor(0).setDepth(10);

    this.physics.add.overlap(this.player, this.coins, (player, coin) => {
      coin.destroy();
      this.coinSfx.play();
      this.coinCount++;
      this.coinText.setText(this.coinCount);
    });

    // Timer
    this.timeRemaining = 100;
    this.timerElapsed = 0;
    this.timerActive = false;
    this.timerText = this.add.text(771, 42, '100', {
      fontSize: '14px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(10);

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
    this.isPaused = false;
    this.attackEnabled = true;
    this.dashEnabled = true;
    this.isClimbing = false;

    this.music = this.sound.add('level2-theme', { loop: true, volume: 0.5 });
    this.deathSfx = this.sound.add('death-sfx');
    this.coinSfx = this.sound.add('coin-sfx', { volume: 0.4 });

    const menuMusic = this.sound.get('menu-music');
    if (menuMusic && menuMusic.isPlaying) {
      this.tweens.add({ targets: menuMusic, volume: 0, duration: 800, ease: 'Linear',
        onComplete: () => menuMusic.stop() });
    }

    this.createPauseMenu();
    this.createPauseButton();
    if (this.isFirstEntry) this.showLevelIntro();

    this.input.keyboard.on('keydown-ESC', () => {
      const onGround = this.player.body.blocked.down;
      if (!onGround || this.isSpawning || this.isDead || this.enteringCave) return;
      if (this.isPaused) {
        this.resumeGame();
      } else {
        this.pauseGame();
      }
    });

    if (!this.isFirstEntry) this.spawnPlayer();

    this.player.on('animationcomplete', (anim) => {
      if (anim.key === 'attack' || anim.key === 'walkattack') {
        this.isAttacking = false;
      }
    });
  }

  showLevelIntro() {
    const cx = 400, cy = 225;
    const overlay = this.add.rectangle(cx, cy, 800, 450, 0x000000, 1)
      .setScrollFactor(0).setDepth(50);
    const text = this.add.text(cx, cy, locale.t('level2'), {
      fontSize: '48px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setScrollFactor(0).setDepth(51).setAlpha(0);

    this.tweens.add({
      targets: text,
      alpha: 1,
      duration: 400,
      ease: 'Power2',
      onComplete: () => {
        this.time.delayedCall(1000, () => {
          this.tweens.add({
            targets: [overlay, text],
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
              overlay.destroy();
              text.destroy();
              this.spawnPlayer();
            }
          });
        });
      }
    });
  }

  createPauseButton() {
    const bg = this.add.rectangle(771, 20, 34, 28, 0x000000, 0.5)
      .setScrollFactor(0).setDepth(10).setInteractive();
    const icon = this.add.text(771, 20, '❚❚', {
      fontSize: '13px', fill: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(11);

    bg.on('pointerover', () => bg.setFillStyle(0x333333, 0.8));
    bg.on('pointerout', () => bg.setFillStyle(0x000000, 0.5));
    bg.on('pointerdown', () => {
      if (this.isSpawning || this.isDead || this.enteringCave) return;
      if (this.isPaused) {
        this.resumeGame();
      } else {
        this.pauseGame();
      }
    });
  }

  createPauseMenu() {
    const cx = 400, cy = 225;
    const panelW = 280, panelH = 200;

    this.pauseMenu = this.add.container(0, 0).setDepth(30).setVisible(false).setScrollFactor(0);

    const overlay = this.add.rectangle(cx, cy, 800, 450, 0x000000, 0.6).setScrollFactor(0);
    const panel = this.add.rectangle(cx, cy, panelW, panelH, 0x1a1a2e).setStrokeStyle(2, 0x4444bb).setScrollFactor(0);

    const title = this.add.text(cx, cy - 65, locale.t('paused'), {
      fontSize: '28px', fill: '#ffffff'
    }).setOrigin(0.5).setScrollFactor(0);

    const resumeBtn = this.add.text(cx, cy - 10, locale.t('resume'), {
      fontSize: '20px', fill: '#ffffff',
      backgroundColor: '#2a2a44',
      padding: { x: 24, y: 10 }
    }).setOrigin(0.5).setInteractive().setScrollFactor(0);

    resumeBtn.on('pointerover', () => resumeBtn.setStyle({ backgroundColor: '#3a3a66' }));
    resumeBtn.on('pointerout', () => resumeBtn.setStyle({ backgroundColor: '#2a2a44' }));
    resumeBtn.on('pointerdown', () => this.resumeGame());

    const menuBtn = this.add.text(cx, cy + 50, locale.t('mainMenu'), {
      fontSize: '20px', fill: '#ffffff',
      backgroundColor: '#2a2a44',
      padding: { x: 24, y: 10 }
    }).setOrigin(0.5).setInteractive().setScrollFactor(0);

    menuBtn.on('pointerover', () => menuBtn.setStyle({ backgroundColor: '#3a3a66' }));
    menuBtn.on('pointerout', () => menuBtn.setStyle({ backgroundColor: '#2a2a44' }));
    menuBtn.on('pointerdown', () => {
      this.music.stop();
      this.scene.start('LevelSelectScene');
    });

    this.pauseMenu.add([overlay, panel, title, resumeBtn, menuBtn]);
  }

  pauseGame() {
    this.isPaused = true;
    this.physics.pause();
    this.music.pause();
    this.pauseMenu.setVisible(true);
  }

  resumeGame() {
    this.isPaused = false;
    this.physics.resume();
    this.music.resume();
    this.pauseMenu.setVisible(false);
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
        });
      }
    });
  }

  triggerDeath() {
    this.isDead = true;
    this.input.keyboard.enabled = false;
    this.player.setVelocityX(0);
    this.music.stop();
    this.deathSfx.play();
    this.player.anims.play('death', true);
    this.player.once('animationcomplete', () => {
      if (this.lives - 1 < 0) {
        this.scene.start('GameOverScene');
        return;
      }

      const remainingLives = this.lives - 1;
      const cx = 400, cy = 225;

      const deathOverlay = this.add.rectangle(cx, cy, 800, 450, 0x000000, 1)
        .setScrollFactor(0).setDepth(58).setAlpha(0);
      const deathIcon = this.add.image(cx - 30, cy, 'player_idle', 0)
        .setScrollFactor(0).setDepth(60).setDisplaySize(48, 48).setOrigin(1, 0.5).setAlpha(0);
      const deathText = this.add.text(cx - 14, cy, 'x' + remainingLives, {
        fontSize: '32px', fill: '#ffffff',
        stroke: '#000000', strokeThickness: 4
      }).setScrollFactor(0).setDepth(60).setOrigin(0, 0.5).setAlpha(0);

      this.tweens.add({
        targets: [deathOverlay, deathIcon, deathText],
        alpha: 1,
        duration: 800,
        ease: 'Linear',
        onComplete: () => {
          this.time.delayedCall(2500, () => {
            this.scene.restart({ lives: remainingLives });
          });
        }
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
        this.showLevelComplete();
      }
    });
  }

  showLevelComplete() {
    const totalCoins = objectLayer => 44;
    const prev = JSON.parse(localStorage.getItem('level2') || '{}');
    const best = Math.max(prev.coins || 0, this.coinCount);
    localStorage.setItem('level2', JSON.stringify({ completed: true, coins: best }));

    const cx = 400, cy = 225;

    const dimOverlay = this.add.rectangle(cx, cy, 800, 450, 0x000000, 0)
      .setScrollFactor(0).setDepth(50);
    const panel = this.add.rectangle(cx, cy, 420, 260, 0x1a1a2e, 0)
      .setScrollFactor(0).setDepth(51).setStrokeStyle(2, 0x4444bb);

    const title = this.add.text(cx, cy - 85, locale.t('levelComplete'), {
      fontSize: '34px', fill: '#ffdd00',
      stroke: '#000000', strokeThickness: 5
    }).setOrigin(0.5).setScrollFactor(0).setDepth(52).setAlpha(0);

    const coinIcon = this.add.image(cx - 68, cy - 10, 'coins', 48)
      .setScrollFactor(0).setDepth(52).setScale(2).setOrigin(0.5).setAlpha(0);
    const coinLabel = this.add.text(cx - 40, cy - 10, `${this.coinCount} / 44`, {
      fontSize: '24px', fill: '#ffffff', stroke: '#000000', strokeThickness: 3
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(52).setAlpha(0);

    const menuBtn = this.add.text(cx - 80, cy + 80, locale.t('mainMenu'), {
      fontSize: '17px', fill: '#ffffff',
      backgroundColor: '#2a2a44', padding: { x: 16, y: 9 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(52).setAlpha(0).setInteractive();

    const contBtn = this.add.text(cx + 80, cy + 80, locale.t('continueBtn'), {
      fontSize: '17px', fill: '#555555',
      backgroundColor: '#111122', padding: { x: 16, y: 9 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(52).setAlpha(0);

    menuBtn.on('pointerover', () => menuBtn.setStyle({ backgroundColor: '#3a3a66' }));
    menuBtn.on('pointerout', () => menuBtn.setStyle({ backgroundColor: '#2a2a44' }));
    menuBtn.on('pointerdown', () => {
      this.tweens.add({
        targets: this.music,
        volume: 0,
        duration: 400
      });
      this.cameras.main.fade(400, 0, 0, 0, false, (cam, progress) => {
        if (progress === 1) {
          this.music.stop();
          this.scene.start('LevelSelectScene');
        }
      });
    });

    this.tweens.add({
      targets: [dimOverlay, panel, title, coinIcon, coinLabel, menuBtn, contBtn],
      alpha: { from: 0, to: 1 },
      duration: 700,
      ease: 'Power2',
      onStart: () => { dimOverlay.setFillStyle(0x000000, 0.75); panel.setFillStyle(0x1a1a2e, 1); }
    });
  }

  update(time, delta) {
    const onGround = this.player.body.blocked.down;
    const isRunning = this.shiftKey.isDown;
    const speed = isRunning ? 320 : 200;

    this.bgMountains.tilePositionX = this.cameras.main.scrollX * 0.1;
    this.bgFront.tilePositionX = this.cameras.main.scrollX * 0.2;

    if (this.enteringCave || this.isSpawning || this.isDead) return;

    if (!this.timerActive && (this.cursors.left.isDown || this.cursors.right.isDown))
      this.timerActive = true;

    if (!this.isPaused && this.timerActive) {
      this.timerElapsed += delta;
      if (this.timerElapsed >= 1000) {
        this.timerElapsed -= 1000;
        this.timeRemaining = Math.max(0, this.timeRemaining - 1);
        this.timerText.setText(this.timeRemaining);
        if (this.timeRemaining <= 10) {
          this.timerText.setStyle({ fontSize: '14px', fill: '#ff4444', stroke: '#000000', strokeThickness: 3 });
        }
        if (this.timeRemaining <= 0) {
          this.timerActive = false;
          this.triggerDeath();
        }
      }
    }

    if (this.player.y > 680) {
      this.triggerDeath();
      return;
    }

    // Escada
    const playerBounds = this.player.getBounds();
    const onLadder = this.ladderZones.some(zone =>
      Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, zone.getBounds())
    );

    if (this.isClimbing && !onLadder) {
      this.isClimbing = false;
      this.player.body.allowGravity = true;
    }

    if (!this.isClimbing && onLadder && (this.cursors.up.isDown || this.cursors.down.isDown)) {
      this.isClimbing = true;
      this.isJumping = false;
      this.player.body.allowGravity = false;
    }

    if (this.isClimbing) {
      this.player.setVelocityX(0);
      if (this.cursors.up.isDown) {
        this.player.setVelocityY(-150);
        this.player.anims.play('climb', true);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(150);
        this.player.anims.play('climb', true);
      } else {
        this.player.setVelocityY(0);
        this.player.anims.pause();
      }
      if (this.cursors.left.isDown || this.cursors.right.isDown) {
        this.isClimbing = false;
        this.player.body.allowGravity = true;
      }
      return;
    }

    if (this.dashEnabled) {
      if (this.dashCooldown > 0) {
        this.dashCooldown -= this.game.loop.delta;
      }

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
