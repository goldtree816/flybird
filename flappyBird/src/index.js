
import Phaser from "phaser";

const config = {
  type: Phaser.AUTO,
  //width: 800,
  width:2800,
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
let pipes = null;

let pipeHorizontalDistance = 0;

const pipeVerticalDistanceRange = [150, 250];
const pipeHorizontalDistanceRange=[500,550]

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

  pipes=this.physics.add.group();

  for (let i = 0; i < PIPES_TO_RENDER; i++) {
    //const upperPipe = this.physics.add.sprite(0, 0, "pipe").setOrigin(0, 1);
    //const lowerPipe = this.physics.add.sprite(0,0, "pipe").setOrigin(0, 0);
    const upperPipe = pipes.create(0, 0, "pipe").setOrigin(0, 1);
    const lowerPipe = pipes.create  (0,0, "pipe").setOrigin(0, 0);
    placePipe(upperPipe,lowerPipe)
  }
  // Input handlers
  // this.input.on("pointerdown", flap, this);
  // this.input.keyboard.on("keydown_SPACE", flap, this);

  pipes.setVelocityX(-200)

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
  recyclePipes();
}

function placePipe(uPipe, lPipe){
  // pipeHorizontalDistance += 400;
   const rightMostX =getRightMostPipe();
    
    let pipeVerticalDistance = Phaser.Math.Between(
      ...pipeVerticalDistanceRange
    );
    let pipeVerticalPosition = Phaser.Math.Between(
      0 + 20,
      config.height - 20 - pipeVerticalDistance
    );

    let pipeHorizontalDistance=Phaser.Math.Between(...pipeHorizontalDistanceRange)


      uPipe.x= rightMostX+pipeHorizontalDistance;
      uPipe.y= pipeVerticalPosition;

      lPipe.x=uPipe.x;
      lPipe.y=uPipe.y+pipeVerticalDistance


    // lPipe.body.velocity.x = -200;
    // uPipe.body.velocity.x = -200;
}
function recyclePipes(){
  const tempPipes = [];
  pipes.getChildren().forEach(pipe=>{
    if (pipe.getBounds().right <= 0){
      tempPipes.push(pipe);
      if(tempPipes.length === 2){
        placePipe(...tempPipes)
      }

    }
  })
}

function getRightMostPipe() {
  let rightMostX =0;
  pipes.getChildren().forEach(function(pipe){
    rightMostX=Math.max(pipe.x,rightMostX )
  })
  return rightMostX;
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
