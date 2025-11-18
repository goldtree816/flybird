import Phaser from "phaser";
import BaseScene from "./BaseScene";

const PIPES_TO_RENDER = 4;

class PlayScene extends BaseScene {
  constructor(config) {
    super("PlayScene", config);
    this.config = config;

    this.bird = null;
    this.pipes = null;
    this.isPaused = false;
    this.pipeVerticalDistance = 200;
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
        pipeVerticalDistanceRange: [70, 100],
      },
    };

    this.collectibles = null;
    this.collectibleTypes = [];
    for (let i = 65; i <= 90; i++) {
      this.collectibleTypes.push(String.fromCharCode(i));
    }
  }

  create() {
    this.currentDifficulty = "easy";

    // ✅ RESET collectible images every restart
    this.collectibleTypes = [];
    for (let i = 65; i <= 90; i++) {
      this.collectibleTypes.push(String.fromCharCode(i));
    }

    // audio context unlock
    if (
      this.sound &&
      this.sound.context &&
      this.sound.context.state === "suspended"
    ) {
      this.sound.context.resume().catch(() => {});
    }

    // bgMusic
    this.bgMusic = this.sound.add("bgMusic", { loop: true, volume: 0.2 });
    try {
      if (!this.bgMusic.isPlaying) this.bgMusic.play();
    } catch (e) {}

    // 🔥 ADD THIS **RIGHT HERE**
    this.letterSounds = {};
    if (this.collectibleTypes) {
      this.collectibleTypes.forEach((letter) => {
        const key = letter + "_sound";

        if (this.cache.audio.exists(key)) {
          this.letterSounds[letter] = this.sound.add(key);
        }
      });
    }
    // 🔥 END ADDITION

    super.create();
    this.createBG();
    this.createBird();
    this.createCollectibles();
    this.createPipes();
    this.createColliders();
    this.createScore();
    this.createPause();
    this.handleInputs();
    this.listenToEvents();

    // this.anims.create({ key: "fly",...});
    this.anims.create({
      key: "fly",
      frames: this.anims.generateFrameNumbers("bird", { start: 9, end: 15 }),
      frameRate: 8,
      repeat: -1,
    });
    this.bird.play("fly");
  }

  createBG() {
    // BaseScene.create already added sky; keep this if you want a separate or layered background
    // This call is harmless if the same key is used.
    // If you want only one sky image, you can remove one of them.
    // this.add.image(0, 0, "sky").setOrigin(0);
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

  // Robust resume handler — resumes music and starts countdown
  listenToEvents() {
    if (this.pauseEvent) return;

    this.pauseEvent = this.events.on("resume", () => {
      // Freeze gameplay during countdown
      this.physics.pause();
      this.isPaused = true;

      // small delayed resume to avoid race conditions
      try {
        if (this._resumeDelayedCall) {
          this._resumeDelayedCall.remove(false);
        }
      } catch (e) {}

      this._resumeDelayedCall = this.time.delayedCall(50, () => {
        try {
          if (this.bgMusic && this.bgMusic.resume) {
            this.bgMusic.resume(); // prefer resume
          } else if (this.bgMusic && this.bgMusic.play) {
            this.bgMusic.play(); // fallback
          }
        } catch (err) {
          // ignore
        }
      });

      // show countdown and block flapping until finished
      this.isPaused = true;
      this.initialTime = 3;
      if (this.countDownText) this.countDownText.destroy();
      this.countDownText = this.add
        .text(
          ...this.screenCenter,
          "Fly in: " + this.initialTime,
          this.fontOptions
        )
        .setOrigin(0.5);

      if (this.timedEvent) this.timedEvent.remove(false);
      this.timedEvent = this.time.addEvent({
        delay: 1000,
        callback: this.countDown,
        callbackScope: this,
        loop: true,
      });
    });
  }

  countDown() {
    this.initialTime--;
    if (this.countDownText)
      this.countDownText.setText("Fly in: " + this.initialTime);
    if (this.initialTime <= 0) {
      this.isPaused = false;
      if (this.countDownText) this.countDownText.setText("");
      this.physics.resume();
      if (this.timedEvent) this.timedEvent.remove();
    }
  }

  createPause() {
    this.isPaused = false;
    const pauseButton = this.add
      .image(this.config.width - 10, this.config.height - 10, "pause")
      .setScale(3)
      .setOrigin(1)
      .setInteractive();

    pauseButton.on("pointerdown", () => {
      this.isPaused = true;

      // Resume audio context if needed
      if (this.sound.context.state === "suspended") {
        this.sound.context.resume();
      }

      // pause BG music
      try {
        if (this.bgMusic && this.bgMusic.isPlaying) {
          this.bgMusic.pause();
        }
      } catch (e) {}

      // pause scene and launch PauseScene with config so PauseScene knows sizes
      this.scene.pause();
      this.scene.launch("PauseScene", { config: this.config });
    });
  }

  checkGameStatus() {
    //  Prevent crash if bird is null or destroyed
    if (!this.bird || !this.bird.active) return;

    // flap control
    if (this.spaceKey && this.spaceKey.isDown) {
      this.flap();
    }

    // getBounds() ONLY after confirming bird exists
    const birdBounds = this.bird.getBounds();

    // check ground / top collision
    if (birdBounds.bottom >= this.config.height || birdBounds.top <= 0) {
      this.gameOver();
    }
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

  createCollectibles() {
    this.collectibles = this.physics.add.group();

    this.physics.add.overlap(
      this.bird,
      this.collectibles,
      (bird, collectible) => {
        const letter = collectible.texture.key;
        const soundObj = this.letterSounds[letter];

        // 🔥 1. Duck (lower) the music EVERY TIME a collectible is hit
        if (this.bgMusic) {
          this.bgMusic.setVolume(0.03); // lower bg music

          this.time.delayedCall(500, () => {
            if (this.bgMusic) {
              this.bgMusic.setVolume(0.2); // restore volume
            }
          });
        }

        // 🔥 2. PLAY LETTER SOUND
        if (this.sound.context.state === "suspended") {
          this.sound.context.resume();
        }

        if (soundObj) {
          soundObj.play();
        } else {
          this.sound.play(letter + "_sound");
        }

        // 🔥 Destroy collectible safely
        collectible.disableBody(true, true);
        this.time.delayedCall(150, () => collectible.destroy());

        // 🔥 Score
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);
        this.saveBestScore();
      },
      null,
      this
    );
  }

  placePipe(uPipe, lPipe) {
    const difficulty = this.difficulties[this.currentDifficulty];
    const rightMostX = this.getRightMostPipe();

    const pipeVerticalDistance = Phaser.Math.Between(
      ...difficulty.pipeVerticalDistanceRange
    );
    const pipeVerticalPosition = Phaser.Math.Between(
      20,
      this.config.height - 20 - pipeVerticalDistance
    );

    const pipeHorizontalDistance = Phaser.Math.Between(
      ...difficulty.pipeHorizontalDistanceRange
    );

    uPipe.x = rightMostX + pipeHorizontalDistance;
    uPipe.y = pipeVerticalPosition;

    lPipe.x = uPipe.x;
    lPipe.y = uPipe.y + pipeVerticalDistance;

    const gapCenterY = uPipe.y + pipeVerticalDistance / 2;
    this.placeCollectible(uPipe.x + 50, gapCenterY);
  }

  // placeCollectible(x, y) {
  //   const randomLetter = Phaser.Utils.Array.GetRandom(this.collectibleTypes);

  //   const collectible = this.collectibles
  //     .create(x, y, randomLetter)
  //     .setScale(0.12)
  //     .setOrigin(0.5);

  //   collectible.body.allowGravity = false;
  //   collectible.body.velocity.x = -200;
  // }
  placeCollectible(x, y) {
    // 🔥 If no letters left → stop creating collectibles
    if (this.collectibleTypes.length === 0) {
      return;
    }

    // 🔥 Pick a random **index** instead of value
    const index = Phaser.Math.Between(0, this.collectibleTypes.length - 1);
    const randomLetter = this.collectibleTypes[index];

    // 🔥 REMOVE that letter so it can never appear again
    this.collectibleTypes.splice(index, 1);

    const collectible = this.collectibles
      .create(x, y, randomLetter)
      .setScale(0.12)
      .setOrigin(0.5);

    collectible.body.allowGravity = false;
    collectible.body.velocity.x = -200;
  }

  recyclePipes() {
    if (!this.collectibles || !this.pipes) return;

    this.collectibles.getChildren().forEach((c) => {
      if (c.getBounds().right <= 0) {
        c.destroy();
      }
    });

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
    if (this.score === 1) this.currentDifficulty = "normal";
    if (this.score === 3) this.currentDifficulty = "hard";
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

    // IMPORTANT FIX — stop old bgMusic before restart
    if (this.bgMusic) {
      this.bgMusic.stop();
      this.bgMusic.destroy();
      this.bgMusic = null;
    }

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.scene.restart();
      },
      loop: false,
    });
  }

  flap() {
    if (this.isPaused) return;
    this.bird.body.velocity.y = -this.flapVelocity;
  }

  increaseScore() {
    this.score++;
    this.scoreText.setText(`Score: ${this.score}`);
  }
}

export default PlayScene;
