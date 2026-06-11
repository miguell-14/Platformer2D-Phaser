export default class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LevelSelectScene' });
  }

  create() {
    this.add.text(400, 100, 'Selecionar Nível', {
      fontSize: '36px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    const levels = [
      { label: 'Nível 1', scene: 'GameScene', unlocked: true },
      { label: 'Nível 2', scene: null, unlocked: false },
    ];

    this.selected = 0;

    this.options = levels.map((level, i) => {
      const color = level.unlocked ? '#ffffff' : '#555555';
      const text = this.add.text(400, 220 + i * 80, level.label, {
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

    this.levels = levels;

    this.cursor = this.add.text(270, 220, '▶', {
      fontSize: '28px',
      fill: '#ffdd00'
    }).setOrigin(0.5, 0.5);

    this.updateCursor();

    const keys = this.input.keyboard.createCursorKeys();

    keys.up.on('down', () => {
      this.selected = (this.selected - 1 + levels.length) % levels.length;
      this.updateCursor();
    });

    keys.down.on('down', () => {
      this.selected = (this.selected + 1) % levels.length;
      this.updateCursor();
    });

    this.input.keyboard.on('keydown-ENTER', () => {
      const level = this.levels[this.selected];
      if (level.unlocked) {
        this.scene.start(level.scene);
      }
    });

    this.add.text(400, 420, 'Prima ENTER para entrar', {
      fontSize: '16px',
      fill: '#888888'
    }).setOrigin(0.5);
  }

  updateCursor() {
    this.cursor.setY(220 + this.selected * 80);
  }
}
