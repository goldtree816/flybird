
import BaseScene from './BaseScene';


class MenuScene extends BaseScene {

  constructor(config) {
    super('MenuScene', config);   
        this.menu = [
      {scene: 'PlayScene', text: 'Play'},
      {scene: 'ScoreScene', text: 'Score'},
      {scene: null, text: 'Exit'},
    ]

  }



  create() {
    super.create();
   // this.add.image(0, 0, 'sky').setOrigin(0);
    //this.scene.start('PlayScene');
  
    this.createMenu(this.menu);
  }
}

export default MenuScene;