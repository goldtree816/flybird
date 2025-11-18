// import BaseScene from './BaseScene';

// class PauseScene extends BaseScene {

//   constructor(config) {
//     super('PauseScene', config);

//     this.menu = [
//       {scene: 'PlayScene', text: 'Continue'},
//       {scene: 'MenuScene', text: 'Exit'},
//     ]
//   }

//   create() {
//     super.create();
//     this.createMenu(this.menu, this.setupMenuEvents.bind(this));
//   }

//   setupMenuEvents(menuItem) {
//     const textGO = menuItem.textGO;
//     textGO.setInteractive();

//     textGO.on('pointerover', () => {
//       textGO.setStyle({fill: '#ff0'});
//     })

//     textGO.on('pointerout', () => {
//       textGO.setStyle({fill: '#fff'});
//     })

//     textGO.on('pointerup', () => {
//       //console.log('Clicking on some option!');
//         if (menuItem.scene && menuItem.text === 'Continue') {

//         // Shutting down the Pause Scene and resuming the Play Scene
//         this.scene.stop();
//         this.scene.resume(menuItem.scene);

//       } else {
//         // Shutting PlayScene, PauseScene and running Menu
//         this.scene.stop('PlayScene');
//         this.scene.start(menuItem.scene);
//       }
//     })
//   }
// }

// export default PauseScene;import BaseScene from './BaseScene';

// import BaseScene from './BaseScene';

// class PauseScene extends BaseScene {

//   constructor(config) {
//     super('PauseScene', config);

//     this.menu = [
//       { scene: 'PlayScene', text: 'Continue' },
//       { scene: 'MenuScene', text: 'Exit' }
//     ];
//   }

//   create(data) {
//     // Receive config from PlayScene
//     if (data && data.config) {
//       this.config = data.config;
//       this.screenCenter = [
//         this.config.width / 2,
//         this.config.height / 2
//       ];
//     }

//     // Draw background (sky)
//     super.create();

//     // Draw menu
//     this.createMenu(this.menu, this.setupMenuEvents.bind(this));
//   }

//   setupMenuEvents(menuItem) {
//     const textGO = menuItem.textGO;
//     textGO.setInteractive();

//     textGO.on('pointerover', () => {
//       textGO.setStyle({ fill: '#ff0' });
//     });

//     textGO.on('pointerout', () => {
//       textGO.setStyle({ fill: '#fff' });
//     });

//     textGO.on('pointerup', () => {
//       if (menuItem.text === 'Continue') {
//         this.scene.resume('PlayScene');
//         this.scene.stop();
//       } else {
//         this.scene.stop('PlayScene');
//         this.scene.start(menuItem.scene);
//       }
//     });
//   }
// }

// export default PauseScene;

import BaseScene from "./BaseScene";

class PauseScene extends BaseScene {
  constructor(config) {
    super("PauseScene", config);

    this.menu = [
      { scene: "PlayScene", text: "Continue" },
      { scene: "MenuScene", text: "Exit" },
    ];
  }

  create(data) {
    // Accept config passed from PlayScene.launch
    if (data && data.config) {
      this.config = data.config;
      this.screenCenter = [this.config.width / 2, this.config.height / 2];
    }

    // draw background and optional back button from BaseScene
    super.create();

    // create menu items
    this.createMenu(this.menu, this.setupMenuEvents.bind(this));
  }

  setupMenuEvents(menuItem) {
    const textGO = menuItem.textGO;
    textGO.setInteractive();

    textGO.on("pointerover", () => {
      textGO.setStyle({ fill: "#ff0" });
    });

    textGO.on("pointerout", () => {
      textGO.setStyle({ fill: "#fff" });
    });

    textGO.on("pointerup", () => {
      if (menuItem.text === "Continue") {
        // Resume PlayScene first so PlayScene's resume event fires,
        // then stop PauseScene to remove menu.
        this.scene.resume("PlayScene");
        this.scene.stop();
      } else {
        // Exit to main menu
        this.scene.stop("PlayScene");
        this.scene.start(menuItem.scene);
      }
    });
  }
}

export default PauseScene;
