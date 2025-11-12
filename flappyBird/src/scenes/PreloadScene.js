import Phaser from 'phaser';
import BaseScene from './BaseScene';

class PreloadScene extends BaseScene {

  constructor() {
    super('PreloadScene', {width:800, height:600});
  }

  preload() {
    this.load.image('sky', 'assets/sky.png');
    //this.load.image('bird', 'assets/bird.png');
      this.load.spritesheet('bird', 'assets/birdSprite.png', {
      frameWidth: 16, frameHeight: 16
    });
    this.load.image('pipe', 'assets/pipe.png');
    this.load.image('pause', 'assets/pause.png');
    this.load.image('back', 'assets/back.png');
    //this.loadPhonicsAssets();
      for (let i = 65; i <= 90; i++) { // ASCII a–z
    const letter = String.fromCharCode(i);
    this.load.image(letter, `assets/phonics/${letter}.png`);
  }
  }

  create() {
    this.scene.start('MenuScene');
  }
}

export default PreloadScene;