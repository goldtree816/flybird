
import Phaser from "phaser";
import PlayScene from "./scenes/PlayScene";
import MenuScene from './scenes/MenuScene';
import PreloadScene from './scenes/PreloadScene';
import ScoreScene from "./scenes/ScoreScene";
import PauseScene from "./scenes/PauseScene";

console.log({
  PreloadScene,
  MenuScene,
  ScoreScene,
  PlayScene,
  PauseScene
});

const WIDTH = 400;
const HEIGHT = 600;
const BIRD_POSITION = { x: WIDTH * 0.1, y: HEIGHT / 2 };

const SHARED_CONFIG = {
  width: WIDTH,
  height: HEIGHT,
  startPosition: BIRD_POSITION,
};

// scenes array
const Scenes = [PreloadScene, MenuScene, ScoreScene, PlayScene, PauseScene];
const createScene = Scene => new Scene(SHARED_CONFIG);
const initScenes = () => Scenes.map(createScene);

const config = {
  type: Phaser.AUTO,
  parent: 'phaser-app',    // attach canvas to the div
  // width: WIDTH,
  // height: HEIGHT,
  width: 400,
  height: 600,
  pixelArt: true,

  scale: {
    mode: Phaser.Scale.FIT,          // FIT keeps aspect ratio and fits inside the container
    autoCenter: Phaser.Scale.CENTER_BOTH,
    //parent: "phaser-app",
    // width: WIDTH,
    // height: HEIGHT
    width: 400,
    height: 600
  },

  physics: {
    default: "arcade",
    arcade: { debug: false },
  },

  scene: initScenes()
};

new Phaser.Game(config);