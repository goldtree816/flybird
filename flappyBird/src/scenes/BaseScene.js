import Phaser from 'phaser';

class BaseScene extends Phaser.Scene {

  constructor(key, config) {
    super(key);
    this.config = config;
     this.screenCenter = [config.width / 2, config.height / 2];
    this.fontSize = 34;
    this.lineHeight = 42;
    // this.fontOptions = {fontSize: `${this.fontSize}px`, fill: '#CD00FF'};
    this.fontOptions = {fontSize: `${this.fontSize}px`, fill: '#fff'};
  }

  loadPhonicsAssets() {
  const phonicsMap = {
    A: 'apple',
    B: 'ball',
    C: 'cat',
    D: 'dog',
    E: 'elephant',
    F: 'fish',
    G: 'grapes',
    H: 'hat',
    I: 'icecream',
    J: 'jug',
    K: 'kite',
    L: 'lion',
    M: 'monkey',
    N: 'nest',
    O: 'orange',
    P: 'parrot',
    Q: 'queen',
    R: 'rabbit',
    S: 'sun',
    T: 'train',
    U: 'umbrella',
    V: 'van',
    W: 'watch',
    X: 'xylophone',
    Y: 'yak',
    Z: 'zebra'
  };

  for (const [letter, name] of Object.entries(phonicsMap)) {
    this.load.image(letter, `assets/phonics/${letter}_${name}.png`);
  }
}


  create() {
    this.add.image(0, 0, 'sky').setOrigin(0);

    if (this.config.canGoBack) {
      const backButton = this.add.image(this.config.width - 10, this.config.height -10, 'back')
        .setOrigin(1)
        .setScale(2)
        .setInteractive()

      backButton.on('pointerup', () => {
        this.scene.start('MenuScene');
      })
    }
  }
    // createMenu(menu) {
    createMenu(menu, setupMenuEvents) {
    let lastMenuPositionY = 0;

    menu.forEach(menuItem => {
      const menuPosition = [this.screenCenter[0], this.screenCenter[1] + lastMenuPositionY];
     // this.add.text(...menuPosition, menuItem.text, this.fontOptions).setOrigin(0.5, 1);
      menuItem.textGO = this.add.text(...menuPosition, menuItem.text, this.fontOptions).setOrigin(0.5, 1);
     lastMenuPositionY += this.lineHeight;
     setupMenuEvents(menuItem);
    })
  }
}

export default BaseScene;