// import Phaser from "phaser";
// import PlayScene from "./scenes/PlayScene";
// import MenuScene from './scenes/MenuScene';
// import PreloadScene from './scenes/PreloadScene';
// import ScoreScene from "./scenes/ScoreScene";
// import PauseScene from "./scenes/PauseScene"

// //const WIDTH = 800;
// const WIDTH = 400;
// const HEIGHT = 600;
// const BIRD_POSITION = { x: WIDTH * 0.1, y: HEIGHT / 2 };

// const SHARED_CONFIG = {
//   width: WIDTH,
//   height: HEIGHT,
//   startPosition: BIRD_POSITION,
// };

// const Scenes = [PreloadScene, MenuScene, ScoreScene, PlayScene,PauseScene];
// const createScene = Scene => new Scene(SHARED_CONFIG)
// const initScenes = () => Scenes.map(createScene)

// const config = {
//   type: Phaser.AUTO,

//   ...SHARED_CONFIG,
//   pixelArt: true,
//   physics: {
//     default: "arcade",
//     arcade: {
//       //gravity: { y: 400 },
    
//     },
//   },

//   scene: initScenes()
//   };

// new Phaser.Game(config);

import Phaser from "phaser";
import PlayScene from "./scenes/PlayScene";
import MenuScene from './scenes/MenuScene';
import PreloadScene from './scenes/PreloadScene';
import ScoreScene from "./scenes/ScoreScene";
import PauseScene from "./scenes/PauseScene";

const WIDTH = 400;
const HEIGHT = 600;
const BIRD_POSITION = { x: WIDTH * 0.1, y: HEIGHT / 2 };

const SHARED_CONFIG = {
  width: WIDTH,
  height: HEIGHT,
  parent: "game-container",
  startPosition: BIRD_POSITION,
};

const Scenes = [PreloadScene, MenuScene, ScoreScene, PlayScene, PauseScene];
const createScene = Scene => new Scene(SHARED_CONFIG);
const initScenes = () => Scenes.map(createScene);

const config = {
  type: Phaser.AUTO,

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  pixelArt: true,

  physics: {
    default: "arcade",
    arcade: {},
  },

  scene: initScenes(),
};

const game = new Phaser.Game(config);

window.addEventListener("resize", () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});
