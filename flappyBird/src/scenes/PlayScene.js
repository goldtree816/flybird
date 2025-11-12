import Phaser from "phaser";
import BaseScene from "./BaseScene";

const PIPES_TO_RENDER = 4;

class PlayScene extends BaseScene {
  constructor(config) {
    super("PlayScene", config); //
    this.config = config;
    this.bird = null;
    this.pipes = null;
    this.isPaused = false;
    this.collectibles = null;
    this.collectibleTypes = []; // Will be filled with a–z later
    this.pipeVerticalDistance = 200; // or your existing gap setting

    //this.pipeHorizontalDistance = 0;
    // this.pipeVerticalDistanceRange = [150, 250];
    // this.pipeHorizontalDistanceRange = [500, 550];
    this.flapVelocity = 300;
    this.score = 0;
    this.scoreText = "";
    this.currentDifficulty = "easy";
    this.difficulties = {
      easy: {
        pipeHorizontalDistanceRange: [300, 350],
        pipeVerticalDistanceRange: [150, 200],
      },
      normal: {
        pipeHorizontalDistanceRange: [280, 330],
        pipeVerticalDistanceRange: [140, 190],
      },
      hard: {
        pipeHorizontalDistanceRange: [250, 310],
        //pipeVerticalDistanceRange: [120, 150]
        pipeVerticalDistanceRange: [70, 100],
      },
    };
  }

  create() {
    //this.currentDifficulty = 'hard';
    this.currentDifficulty = "easy";
    super.create();
    this.collectibleTypes = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    this.createBG();
    this.createBird();
    this.createPipes();
    this.createColliders();
    this.createScore();
    this.createPause();
    this.handleInputs();
    this.screenCenter = [this.config.width / 2, this.config.height / 2];
    this.fontOptions = { fontSize: "32px", fill: "#000" };
    this.listenToEvents();
    this.anims.create({
      key: "fly",
      frames: this.anims.generateFrameNumbers("bird", { start: 9, end: 15 }),
      // 24 fps default, it will play animation consisting of 24 frames in 1 second
      // in case of framerate 2 and sprite of 8 frames animations will play in
      // 4 sec; 8 / 2 = 4
      frameRate: 8,
      // repeat infinitely
      repeat: -1,
    });

    this.bird.play("fly");
    this.createCollectibles();
  }

  createBG() {
    this.add.image(0, 0, "sky").setOrigin(0);
  }

  createBird() {
    this.bird = this.physics.add
      .sprite(this.config.startPosition.x, this.config.startPosition.y, "bird")
      .setFlipX(true)
      .setScale(3)
      .setOrigin(0);

    this.bird.body.gravity.y = 600;
    this.bird.setCollideWorldBounds(true);
  }
  createPipes() {
    this.pipes = this.physics.add.group();

    for (let i = 0; i < PIPES_TO_RENDER; i++) {
      const upperPipe = this.pipes
        .create(0, 0, "pipe")
        .setImmovable(true)
        .setOrigin(0, 1);
      const lowerPipe = this.pipes
        .create(0, 0, "pipe")
        .setImmovable(true)
        .setOrigin(0, 0);

      this.placePipe(upperPipe, lowerPipe);
    }

    this.pipes.setVelocityX(-200);
  }

  createColliders() {
    this.physics.add.collider(this.bird, this.pipes, this.gameOver, null, this);
  }
  createScore() {
    this.score = 0;
    const bestScore = localStorage.getItem("bestScore");
    this.scoreText = this.add.text(16, 16, `Score: ${0}`, {
      fontSize: "32px",
      fill: "#000",
    });
    this.add.text(16, 52, `Best score: ${bestScore || 0}`, {
      fontSize: "18px",
      fill: "#000",
    });
  }

  handleInputs() {
    this.input.on("pointerdown", this.flap, this);
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
  }
  update() {
    this.checkGameStatus();
    this.recyclePipes();
  }

  listenToEvents() {
 
    if (this.pauseEvent) {
      return;
    }
    this.pauseEvent = this.events.on("resume", () => {
      this.isPaused = true; //
      this.initialTime = 3;
      this.countDownText = this.add
        .text(
          ...this.screenCenter,
          "Fly in: " + this.initialTime,
          this.fontOptions
        )
        .setOrigin(0.5);
      // this.physics.pause();//

      this.timedEvent = this.time.addEvent({
        delay: 1000,
        //callback: () => console.log(this.initialTime--),
        callback: this.countDown,
        callbackScope: this,
        loop: true,
      });
    });
  }
  countDown() {
    this.initialTime--;
    this.countDownText.setText("Fly in: " + this.initialTime);
    if (this.initialTime <= 0) {
      this.isPaused = false;
      this.countDownText.setText("");
      this.physics.resume();
      this.isPaused = false;
      this.timedEvent.remove();
    }
  }
  createPause() {
    this.isPaused = false;
    const pauseButton = this.add
      .image(this.config.width - 10, this.config.height - 10, "pause")
      .setScale(3)
      .setOrigin(1)
      .setInteractive(); //added to make the button work

    pauseButton.on("pointerdown", () => {
      //this.physics.pause();
      this.isPaused = true;
      this.scene.pause();
      this.scene.launch("PauseScene", this.config); //added to make the config work
    });
  }

  checkGameStatus() {
    if (this.spaceKey.isDown) {
      this.flap();
    }
    // if (this.bird.y > this.config.height || this.bird.y < -this.bird.height)
    if (
      this.bird.getBounds().bottom >= this.config.height ||
      this.bird.y <= 0
    ) {
      this.gameOver();
    }
  }
  placePipe(uPipe, lPipe) {
    const difficulty = this.difficulties[this.currentDifficulty];
    const rightMostX = this.getRightMostPipe();

    const pipeVerticalDistance = Phaser.Math.Between(
      ...difficulty.pipeVerticalDistanceRange
    );
    const pipeVerticalPosition = Phaser.Math.Between(
      0 + 20,
      this.config.height - 20 - pipeVerticalDistance
    );

    const pipeHorizontalDistance = Phaser.Math.Between(
      ...difficulty.pipeHorizontalDistanceRange
    );

    uPipe.x = rightMostX + pipeHorizontalDistance;
    uPipe.y = pipeVerticalPosition;

    lPipe.x = uPipe.x;
    lPipe.y = uPipe.y + pipeVerticalDistance;
  }
  recyclePipes() {
    const tempPipes = [];
    this.pipes.getChildren().forEach((pipe) => {
      if (pipe.getBounds().right <= 0) {
        tempPipes.push(pipe);
        if (tempPipes.length === 2) {
          this.placePipe(...tempPipes);
          this.increaseScore();
          this.saveBestScore();
          this.increaseDifficulty();
        }
      }
    });
  }
  getRightMostPipe() {
    let rightMostX = 0;

    this.pipes.getChildren().forEach(function (pipe) {
      rightMostX = Math.max(pipe.x, rightMostX);
    });

    return rightMostX;
  }
  increaseDifficulty() {
    if (this.score === 1) {
      this.currentDifficulty = "normal";
    }

    if (this.score === 3) {
      this.currentDifficulty = "hard";
    }
  }
  saveBestScore() {
    const bestScoreText = localStorage.getItem("bestScore");
    const bestScore = bestScoreText && parseInt(bestScoreText, 10);

    if (!bestScore || this.score > bestScore) {
      localStorage.setItem("bestScore", this.score);
    }
  }
  gameOver() {
    this.physics.pause();
    this.bird.setTint(0xee4824);
    this.saveBestScore();

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.scene.restart();
      },
      loop: false,
    });
  }

  flap() {
    if (this.isPaused) {
      return;
    }
    this.bird.body.velocity.y = -this.flapVelocity;
  }
  increaseScore() {
    this.score++;
    this.scoreText.setText(`Score: ${this.score}`);
  }
  createCollectibles() {
    this.collectibles = this.physics.add.group();

    // Spawn random letters every 3 seconds
    this.time.addEvent({
      delay: 3000,
      callback: this.spawnCollectible,
      callbackScope: this,
      loop: true,
    });
  }
}

export default PlayScene;
