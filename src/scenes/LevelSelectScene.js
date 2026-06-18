import { locale } from '../locale.js';

export default class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelectScene' });
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;
    this.cameras.main.fadeIn(300, 0, 0, 0);

    const menuMusic = this.sound.get('menu-music');
    if (menuMusic && menuMusic.isPlaying && menuMusic.volume >= 0.5) {
      // já a tocar normalmente (vindo do menu), não faz nada
    } else {
      if (menuMusic) menuMusic.destroy();
      const music = this.sound.add('menu-music', { loop: true, volume: 0 });
      music.play();
      this.tweens.add({ targets: music, volume: 0.6, duration: 1000, ease: 'Linear' });
    }

    // Background
    this.add.image(0, 0, 'bg_sky').setOrigin(0, 0).setDisplaySize(width, height);
    this.add.tileSprite(0, height, width, 320, 'bg_mountains').setOrigin(0, 1);
    this.add.tileSprite(0, height, width, 320, 'bg_front').setOrigin(0, 1);

    // Title
    this.add.text(400, 70, locale.t('selectLevel'), {
      fontSize: '38px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5);

    const levels = [
      { key: 'level1', scene: 'GameScene', unlocked: true },
      { key: 'level2', scene: null, unlocked: false },
    ];

    this.selected = 0;
    this.levels = levels;

    // Level cards
    const cardW = 200;
    const cardH = 180;
    const cardY = 230;
    const cardPositions = [240, 560];

    this.cards = levels.map((level, i) => {
      const cx = cardPositions[i];
      const save = JSON.parse(localStorage.getItem(level.key) || '{}');

      const bg = this.add.rectangle(cx, cardY, cardW, cardH, 0x1a1a2e);
      const border = this.add.rectangle(cx, cardY, cardW, cardH)
        .setStrokeStyle(3, level.unlocked ? 0x4444bb : 0x333355).setFillStyle();

      const label = this.add.text(cx, cardY - 50, locale.t(level.key), {
        fontSize: '24px',
        fill: level.unlocked ? '#ffffff' : '#555555',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);

      if (save.completed) {
        this.add.text(cx, cardY - 10, locale.t('completed'), {
          fontSize: '14px', fill: '#44ff44',
          stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);

        this.add.image(cx - 45, cardY + 30, 'coins', 48)
          .setScale(2).setOrigin(0.5);
        this.add.text(cx - 20, cardY + 30, `${save.coins} / 44`, {
          fontSize: '16px', fill: '#ffffff',
          stroke: '#000000', strokeThickness: 3
        }).setOrigin(0, 0.5);
      }

      if (!level.unlocked) {
        this.add.rectangle(cx, cardY, cardW, cardH, 0x000000, 0.5);
        this.add.text(cx, cardY + 30, '🔒', { fontSize: '36px' }).setOrigin(0.5);
      }

      if (level.unlocked) {
        bg.setInteractive();
        bg.on('pointerover', () => {
          if (this.settingsPanel.visible) return;
          this.selected = i;
          this.updateCards();
        });
        bg.on('pointerdown', () => {
          if (this.settingsPanel.visible) return;
          this.scene.start(level.scene);
        });
      }

      return { bg, border, label };
    });

    this.updateCards();

    // Controls hint
    this.add.text(400, 390, locale.t('pressPlay'), {
      fontSize: '15px',
      fill: '#aaaaaa',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.add.text(400, 415, '← →  navigate', {
      fontSize: '13px',
      fill: '#666666'
    }).setOrigin(0.5);

    // Gear icon
    const gearBtn = this.add.text(770, 20, '⚙', {
      fontSize: '32px',
      fill: '#ffffff'
    }).setOrigin(1, 0).setInteractive().setDepth(10);

    gearBtn.on('pointerover', () => gearBtn.setStyle({ fill: '#ffdd00' }));
    gearBtn.on('pointerout', () => gearBtn.setStyle({ fill: '#ffffff' }));
    gearBtn.on('pointerdown', () => {
      this.originalVolume = this.sound.volume;
      this.originalLang = locale.lang;
      this.pendingLang = locale.lang;
      this.settingsPanel.setVisible(true);
    });

    this.pendingLang = locale.lang;
    this.originalLang = locale.lang;
    this.originalVolume = this.sound.volume;
    this.createSettingsPanel();

    const keys = this.input.keyboard.createCursorKeys();

    keys.left.on('down', () => {
      if (this.settingsPanel.visible) return;
      this.selected = (this.selected - 1 + levels.length) % levels.length;
      this.updateCards();
    });

    keys.right.on('down', () => {
      if (this.settingsPanel.visible) return;
      this.selected = (this.selected + 1) % levels.length;
      this.updateCards();
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      if (this.settingsPanel.visible) return;
      const level = this.levels[this.selected];
      if (level.unlocked) this.scene.start(level.scene);
    });

    this.input.keyboard.on('keydown-ESC', () => {
      if (this.settingsPanel.visible) {
        this.settingsPanel.setVisible(false);
      } else {
        this.cameras.main.fade(400, 0, 0, 0, false, (cam, progress) => {
          if (progress === 1) this.scene.start('MenuScene');
        });
      }
    });
  }

  updateCards() {
    this.cards.forEach((card, i) => {
      const selected = i === this.selected;
      const unlocked = this.levels[i].unlocked;
      if (selected) {
        card.border.setStrokeStyle(3, unlocked ? 0xffdd00 : 0x555555);
      } else {
        card.border.setStrokeStyle(3, unlocked ? 0x4444bb : 0x333355);
      }
    });
  }

  createSettingsPanel() {
    const panelW = 380;
    const panelH = 290;
    const cx = 400;
    const cy = 240;

    this.settingsPanel = this.add.container(0, 0).setDepth(20).setVisible(false);

    const overlay = this.add.rectangle(cx, cy, 800, 450, 0x000000, 0.75).setInteractive();

    const panel = this.add.rectangle(cx, cy, panelW, panelH, 0x1a1a2e)
      .setStrokeStyle(2, 0x4444bb);

    const title = this.add.text(cx, cy - panelH / 2 + 24, locale.t('settings'), {
      fontSize: '22px', fill: '#ffffff'
    }).setOrigin(0.5, 0);

    // Volume
    const volLabel = this.add.text(cx - panelW / 2 + 24, cy - 70, locale.t('volume'), {
      fontSize: '16px', fill: '#cccccc'
    }).setOrigin(0, 0.5);

    const trackX = cx - panelW / 2 + 24;
    const trackW = panelW - 48;
    const trackY = cy - 40;
    const track = this.add.rectangle(trackX + trackW / 2, trackY, trackW, 6, 0x444466);

    const thumbX = trackX + trackW * this.sound.volume;
    const thumb = this.add.rectangle(thumbX, trackY, 14, 22, 0xffffff)
      .setInteractive({ draggable: true });
    this.input.setDraggable(thumb);

    thumb.on('drag', (pointer, dragX) => {
      thumb.x = Phaser.Math.Clamp(dragX, trackX, trackX + trackW);
      this.sound.setVolume((thumb.x - trackX) / trackW);
    });

    // Language
    const langLabel = this.add.text(cx - panelW / 2 + 24, cy, locale.t('language'), {
      fontSize: '16px', fill: '#cccccc'
    }).setOrigin(0, 0.5);

    const langOptions = [
      { key: 'flag-en', lang: 'en' },
      { key: 'flag-pt', lang: 'pt' },
      { key: 'flag-es', lang: 'es' },
    ];

    const langBtns = langOptions.map(({ key, lang }, i) => {
      const x = cx - panelW / 2 + 60 + i * 60;
      const y = cy + 40;

      const highlight = this.add.rectangle(x, y, 44, 30, 0x4444aa)
        .setOrigin(0.5).setVisible(this.pendingLang === lang);

      const img = this.add.image(x, y, key)
        .setDisplaySize(40, 26).setOrigin(0.5).setInteractive();

      img.on('pointerover', () => { if (this.pendingLang !== lang) highlight.setVisible(true).setFillStyle(0x2a2a44); });
      img.on('pointerout', () => { if (this.pendingLang !== lang) highlight.setVisible(false); });
      img.on('pointerdown', () => {
        this.pendingLang = lang;
        langBtns.forEach((b, j) => {
          b.highlight.setVisible(langOptions[j].lang === lang).setFillStyle(0x4444aa);
        });
      });

      return { img, highlight };
    });

    // Back button
    const backBtn = this.add.text(cx - 70, cy + panelH / 2 - 40, locale.t('back'), {
      fontSize: '16px', fill: '#ffffff',
      backgroundColor: '#2a2a44',
      padding: { x: 20, y: 8 }
    }).setOrigin(0.5).setInteractive();

    backBtn.on('pointerover', () => backBtn.setStyle({ backgroundColor: '#3a3a66' }));
    backBtn.on('pointerout', () => backBtn.setStyle({ backgroundColor: '#2a2a44' }));
    backBtn.on('pointerdown', () => {
      this.sound.setVolume(this.originalVolume);
      this.pendingLang = this.originalLang;
      this.settingsPanel.setVisible(false);
    });

    // Save button
    const saveBtn = this.add.text(cx + 70, cy + panelH / 2 - 40, locale.t('save'), {
      fontSize: '16px', fill: '#ffffff',
      backgroundColor: '#2a2a44',
      padding: { x: 20, y: 8 }
    }).setOrigin(0.5).setInteractive();

    saveBtn.on('pointerover', () => saveBtn.setStyle({ backgroundColor: '#3a3a66' }));
    saveBtn.on('pointerout', () => saveBtn.setStyle({ backgroundColor: '#2a2a44' }));
    saveBtn.on('pointerdown', () => {
      if (this.pendingLang !== locale.lang) {
        locale.setLang(this.pendingLang);
        this.scene.restart();
      } else {
        this.settingsPanel.setVisible(false);
      }
    });

    const flagObjects = langBtns.flatMap(b => [b.highlight, b.img]);
    this.settingsPanel.add([overlay, panel, title, volLabel, track, thumb, langLabel, ...flagObjects, backBtn, saveBtn]);
  }

  updateCursor() {
    // kept for compatibility, logic moved to updateCards
  }
}
