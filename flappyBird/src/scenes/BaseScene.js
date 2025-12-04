import Phaser from 'phaser';

 class BaseScene extends Phaser.Scene {
  constructor(key, config) {
    super(key);

    // allow safe default config if undefined
    this.config = config || { width: 800, height: 600, canGoBack: false, startPosition: { x: 100, y: 100 } };
    this.screenCenter = [this.config.width / 2, this.config.height / 2];
    this.fontSize = 34;
    this.lineHeight = 42;
    this.fontOptions = { fontSize: `${this.fontSize}px`, fill: '#fff' };
    
     // Keep references to UI elements if you want to reposition them on resize
    this._ui = {};
  }

  create() {
    // background
    if (this.textures.exists('sky')) {
      this.add.image(0, 0, 'sky').setOrigin(0);
    }

    // optional back button for scenes that allow it
    if (this.config && this.config.canGoBack) {
      const backButton = this.add.image(this.config.width - 10, this.config.height - 10, 'back')
        .setOrigin(1)
        .setScale(2)
        .setInteractive();

      backButton.on('pointerup', () => {
        this.scene.start('MenuScene');
      });
      this._ui.backButton = backButton;
    }
    
    // Register resize handler (works even if using FIT or RESIZE)
    this.scale.on('resize', this.onResize, this);
  }

  // onResize(gameSize) {
  //   // gameSize is an object with width & height for RESIZE mode.
  //   // In FIT mode the internal size doesn't change, but the event will still let you know.
  //   const width = (gameSize && gameSize.width) || this.config.width;
  //   const height = (gameSize && gameSize.height) || this.config.height;

  //   // Update derived values
  //   this.config.width = width;
  //   this.config.height = height;
  //   this.screenCenter = [width / 2, height / 2];

  //   // reposition UI items if present
  //   if (this._ui.backButton) {
  //     this._ui.backButton.setPosition(this.config.width - 10, this.config.height - 10);
  //   }

  //   // reposition other global UI like score / pause if you store refs
  //   if (this._ui.pauseButton) {
  //     this._ui.pauseButton.setPosition(this.config.width - 10, this.config.height - 10);
  //   }
  // }
  onResize(gameSize) {
  const width = (gameSize && gameSize.width) || this.config.width;
  const height = (gameSize && gameSize.height) || this.config.height;

  this.config.width = width;
  this.config.height = height;
  this.screenCenter = [width / 2, height / 2];

  // NEW: Dynamic scale multiplier (based on base resolution 400×600)
  this.scaleMultiplier = Math.min(
    width / 400,
    height / 600
  );

  // Apply scaling to UI elements
  if (this._ui.backButton) {
    this._ui.backButton.setScale(2 * this.scaleMultiplier);
    this._ui.backButton.setPosition(width - 10, height - 10);
  }

  if (this._ui.pauseButton) {
    this._ui.pauseButton.setScale(3 * this.scaleMultiplier);
    this._ui.pauseButton.setPosition(width - 10, height - 10);
  }

  if (this._ui.scoreText) {
    this._ui.scoreText.setFontSize(32 * this.scaleMultiplier);
  }
}


  createMenu(menu, setupMenuEvents) {
    if (!Array.isArray(menu)) return;

    let lastMenuPositionY = 0;
    menu.forEach(menuItem => {
      const menuPosition = [this.screenCenter[0], this.screenCenter[1] + lastMenuPositionY];
      menuItem.textGO = this.add.text(...menuPosition, menuItem.text, this.fontOptions).setOrigin(0.5, 1);
      lastMenuPositionY += this.lineHeight;
      if (typeof setupMenuEvents === 'function') setupMenuEvents(menuItem);
    });
  }
}
export default BaseScene;