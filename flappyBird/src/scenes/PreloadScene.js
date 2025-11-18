import Phaser from "phaser";
import BaseScene from "./BaseScene";

class PreloadScene extends BaseScene {
  constructor() {
    super("PreloadScene", { width: 800, height: 600 });
  }

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.spritesheet("bird", "assets/birdSprite.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.image("pipe", "assets/pipe.png");
    this.load.image("pause", "assets/pause.png");
    this.load.image("back", "assets/back.png");
    //bg music
    this.load.audio("bgMusic", "assets/audio/bg-music.mp3");
    
    // Load A–Z images
    for (let i = 65; i <= 90; i++) {
      // ASCII A–Z
      const letter = String.fromCharCode(i);
      this.load.image(letter, `assets/phonics/${letter}.png`);
    }

    // Load A–Z sounds (A.mp3, B.mp3, ... Z.mp3)
for (let i = 65; i <= 90; i++) {
  const letter = String.fromCharCode(i);
  this.load.audio(letter + "_sound", `assets/sound/${letter}.mp3`);
}
  }

  create() {
    this.input.once('pointerdown', () => {
  if (this.sound && this.sound.context && this.sound.context.state === 'suspended') {
    this.sound.context.resume().catch(() => {});
  }
});
    this.scene.start("MenuScene");
    
  }
}

export default PreloadScene;
