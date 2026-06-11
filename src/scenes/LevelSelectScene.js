import { locale } from '../locale.js';

export default class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelectScene' });
  }

  create() {
    this.add.text(400, 100, locale.t('selectLevel'), {
      fontSize: '36px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    const levels = [
      { key: 'level1', scene: 'GameScene', unlocked: true },
      { key: 'level2', scene: null, unlocked: false },
    ];

    this.selected = 0;
    this.levels = levels;

    this.options = levels.map((level, i) => {
      const color = level.unlocked ? '#ffffff' : '#555555';
      const text = this.add.text(400, 220 + i * 80, locale.t(level.key), {
        fontSize: '28px',
        fill: color
      }).setOrigin(0.5);

      if (!level.unlocked) {
        this.add.text(480, 220 + i * 80, '🔒', {
          fontSize: '22px'
        }).setOrigin(0, 0.5);
      }

      return text;
    });

    this.cursor = this.add.text(270, 220, '▶', {
      fontSize: '28px',
      fill: '#ffdd00'
    }).setOrigin(0.5, 0.5);

    this.updateCursor();

    this.add.text(400, 420, locale.t('pressPlay'), {
      fontSize: '16px',
      fill: '#888888'
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

    keys.up.on('down', () => {
      if (this.settingsPanel.visible) return;
      this.selected = (this.selected - 1 + levels.length) % levels.length;
      this.updateCursor();
    });

    keys.down.on('down', () => {
      if (this.settingsPanel.visible) return;
      this.selected = (this.selected + 1) % levels.length;
      this.updateCursor();
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      if (this.settingsPanel.visible) return;
      const level = this.levels[this.selected];
      if (level.unlocked) this.scene.start(level.scene);
    });

    this.input.keyboard.on('keydown-ESC', () => {
      if (this.settingsPanel.visible) this.settingsPanel.setVisible(false);
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
    this.cursor.setY(220 + this.selected * 80);
  }
}
