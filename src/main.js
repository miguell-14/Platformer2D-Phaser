import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import LevelSelectScene from './scenes/LevelSelectScene.js';
import GameScene from './scenes/GameScene.js';
import GameScene2 from './scenes/GameScene2.js';
import GameOverScene from './scenes/GameOverScene.js';

const config = {
  type: Phaser.CANVAS,
  width: 800,
  height: 450,
  roundPixels: true,
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 800 }, debug: false }
  },
  scene: [PreloadScene, MenuScene, LevelSelectScene, GameScene, GameScene2, GameOverScene]
};

const game = new Phaser.Game(config);