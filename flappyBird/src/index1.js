// import Phaser, { Physics, Scene } from "phaser";

// const config = {
//   type: Phaser.AUTO,
//   width: 800,
//   height: 600,
//   physics: {
//     default: "arcade",
//     arcade: {
//       gravity: { y: 400 },
//       debug:true,
//     },
//   },
//   scene: {
//     preload,
//     create,
//     update,
//   },
// };

// //to load assests images, music, animation,...
// function preload() {
//   //'this' context scene
//   //contains functions and properties
//   this.load.image("sky", "assets/sky.png");
//   this.load.image("bird", "assets/bird.png");
// }

// const VELOCITY=200;

// let bird = null;
// let flapVelocity = 300;

// function create() {
//   //x-400
//   //y-300
//   //key of the image

//     //1
//   //bird.body.velocity.x = VELOCITY;
// //2
//   // this.input.on('pointerdown', ()=>{
//   //   console.log('pressing mouse button');
//   // })
//   // this.input.keyboard.on('keydown_space', ()=>{
//   //   console.log('pressing space button');
//   // })
//     this.add.image(0, 0, "sky").setOrigin(0).setScrollFactor(0);
//   bird = this.physics.add
//     .sprite(config.width * 0.1, config.height / 2, "bird")
//     .setOrigin(0);
//   this.input.on('pointerdown', flap,this);
//   this.input.keyboard.on('keydown_SPACE', flap,this)
// }

// function update() {

//   // if(bird.x >= config.width - bird.width) {
//   //    bird.body.velocity.x = -VELOCITY;
//   // } else if (bird.x <= 0) {
//   //   bird.body.velocity.x = VELOCITY;
//   // }

//   }
//   function flap() {
//     //debugger
//     bird.body.velocity.y = -flapVelocity;
//   }

// new Phaser.Game(config);

// import Phaser from "phaser";

// const config = {
//   type: Phaser.AUTO,
//   width: 800,
//   height: 600,
//   physics: {
//     default: "arcade",
//     arcade: {
//       gravity: { y: 400 },
//       debug: true,
//     },
//   },
//   scene: {
//     preload,
//     create,
//     update,
//   },
// };

// const VELOCITY = 200;
// let bird = null;
// const flapVelocity = 300;

// function preload() {
//   this.load.image("sky", "assets/sky.png");
//   this.load.image("bird", "assets/bird.png");
// }

// function create() {
//   // Add static background that doesn’t move
//   this.add.image(0, 0, "sky").setOrigin(0).setScrollFactor(0);

//   // Add bird with physics
//   bird = this.physics.add.sprite(config.width * 0.1, config.height / 2, "bird").setOrigin(0);
//   //bird.setCollideWorldBounds(true); // prevent going out of bounds

//   // Mouse click or touch
//   this.input.on("pointerdown", flap, this);

//   // Space key
//   this.input.keyboard.on("keydown_SPACE", flap, this);
// }

// function flap() {
//   if (isGameOver) return;
//   bird.setVelocityY(-flapVelocity);
// }

// function update(time, delta) {
//   // optional: prevent the bird from rotating or falling off-screen weirdly
//   // if (bird.y > config.height - bird.height) {
//   //   bird.y = config.height - bird.height;
//   //   bird.setVelocityY(0);
//   // } else if (bird.y < 0) {
//   //   bird.y = 0;
//   //   bird.setVelocityY(0);
//   // }

//   if(bird.y > config.height || bird.y < -bird.height ){

//     alert('you have lost')

//   }
// }

// new Phaser.Game(config);

import Phaser from "phaser";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      //gravity: { y: 400 },
      debug: true,
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

const VELOCITY=200
const PIPES_TO_RENDER = 4;

let bird = null;

let pipeHorizontalDistance = 0;

const pipeVerticalDistanceRange = [150, 250];

const flapVelocity = 250;

const initalBirdPosition = { x: config.width * 0.1, y: config.height / 2 };

function preload() {
  this.load.image("sky", "assets/sky.png");
  this.load.image("bird", "assets/bird.png");
  this.load.image("pipe", "assets/pipe.png");
}

function create() {
  // Add static background
  this.add.image(0, 0, "sky").setOrigin(0).setScrollFactor(0);

  // Add bird with physics
  bird = this.physics.add
    .sprite(initalBirdPosition.x, initalBirdPosition.y, "bird")
    .setOrigin(0);
  bird.body.gravity.y = 400;

  for (let i = 0; i < PIPES_TO_RENDER; i++) {
    const upperPipe = this.physics.add.sprite(0, 0, "pipe").setOrigin(0, 1);
    const lowerPipe = this.physics.add.sprite(0,0, "pipe").setOrigin(0, 0);
    placePipe(upperPipe,lowerPipe)
  }
  // Input handlers
  // this.input.on("pointerdown", flap, this);
  // this.input.keyboard.on("keydown_SPACE", flap, this);

   this.input.on("pointerdown", flap, this);
   this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
}
function update(time, delta) {
  if (bird.y > config.height || bird.y < -bird.height) {
    restartBirdPosition();
  }
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
    flap();
  }
}

function placePipe(uPipe, lPipe){
   pipeHorizontalDistance += 400;
    let pipeVerticalDistance = Phaser.Math.Between(
      ...pipeVerticalDistanceRange
    );
    let pipeVerticalPosition = Phaser.Math.Between(
      0 + 20,
      config.height - 20 - pipeVerticalDistance
    );


      uPipe.x= pipeHorizontalDistance;
      uPipe.y= pipeVerticalPosition;

      lPipe.x=uPipe.x;
      lPipe.y=uPipe.y+pipeVerticalDistance


    lPipe.body.velocity.x = -200;
    uPipe.body.velocity.x = -200;
}

function restartBirdPosition() {
  bird.x = initalBirdPosition.x;
  bird.y = initalBirdPosition.y;
  bird.body.velocity.y = 0;
}

function flap() {
   bird.body.velocity.y = -flapVelocity;
}



new Phaser.Game(config);
