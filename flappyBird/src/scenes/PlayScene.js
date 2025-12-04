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

    // temporary placeholders — will be recalculated AFTER scaleMultiplier exists
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

    // A–Z collectibles
    this.collectibles = null;
    this.collectibleTypes = [];
    for (let i = 65; i <= 90; i++) {
      this.collectibleTypes.push(String.fromCharCode(i));
    }
  }

  create() {
    this.currentDifficulty = "easy";

    // RESET letters
    this.collectibleTypes = [];
    for (let i = 65; i <= 90; i++) {
      this.collectibleTypes.push(String.fromCharCode(i));
    }

    // Unlock audio context if needed
    if (this.sound?.context?.state === "suspended") {
      this.sound.context.resume().catch(() => {});
    }

    // Music
    this.bgMusic = this.sound.add("bgMusic", { loop: true, volume: 0.2 });
    try { if (!this.bgMusic.isPlaying) this.bgMusic.play(); } catch (e) {}

    // Load letter sounds
    this.letterSounds = {};
    this.collectibleTypes.forEach((letter) => {
      const key = letter + "_sound";
      if (this.cache.audio.exists(key)) {
        this.letterSounds[letter] = this.sound.add(key);
      }
    });

    super.create();

    // 🌟 REAL RESPONSIVE SCALING — NOW AT THE TOP OF CREATE
    const sx = this.game.scale.displaySize.width / this.config.width;
    const sy = this.game.scale.displaySize.height / this.config.height;
    this.scaleMultiplier = Math.min(sx, sy);
    //this.scaleMultiplier = this.game.scale.scaleFactor.x;


    // 🔥 FIX: scale all difficulty ranges NOW (not in constructor)
    this.scaleDifficultyValues();

    // Objects
    this.createBG();
    this.createBird();
    this.createCollectibles();
    this.createPipes();
    this.createColliders();
    this.createScore();
    this.createPause();
    this.handleInputs();
    this.listenToEvents();

    // Bird animation
    this.anims.create({
      key: "fly",
      frames: this.anims.generateFrameNumbers("bird", { start: 9, end: 15 }),
      frameRate: 8,
      repeat: -1,
    });
    this.bird.play("fly");
  }

  // 🔥 FIX — scaling of difficulty ranges happens here
  scaleDifficultyValues() {
    ["easy", "normal", "hard"].forEach((diff) => {
      const d = this.difficulties[diff];
      d.pipeHorizontalDistanceRange = d.pipeHorizontalDistanceRange.map(
        (v) => v * this.scaleMultiplier
      );
      d.pipeVerticalDistanceRange = d.pipeVerticalDistanceRange.map(
        (v) => v * this.scaleMultiplier
      );
    });
  }

  createBG() {}

  createBird() {
    this.bird = this.physics.add
      .sprite(
        this.config.startPosition.x * this.scaleMultiplier,
        this.config.startPosition.y * this.scaleMultiplier,
        "bird"
      )
      .setFlipX(true)
      .setOrigin(0);

    this.bird.body.gravity.y = 600 * this.scaleMultiplier;
    this.flapVelocity = 300 * this.scaleMultiplier;

    this.bird.setCollideWorldBounds(true);
    this.bird.setScale(3 * this.scaleMultiplier);
  }

  createColliders() {
    this.physics.add.collider(this.bird, this.pipes, this.gameOver, null, this);
  }

  createScore() {
    this.score = 0;
    const bestScore = localStorage.getItem("bestScore");

    this.scoreText = this.add
      .text(16 * this.scaleMultiplier, 16 * this.scaleMultiplier, `Score: 0`, {
        fontSize: `${32 * this.scaleMultiplier}px`,
        fill: "#000",
      })
      .setOrigin(0);

    this.add
      .text(
        16 * this.scaleMultiplier,
        52 * this.scaleMultiplier,
        `Best score: ${bestScore || 0}`,
        {
          fontSize: `${18 * this.scaleMultiplier}px`,
          fill: "#000",
        }
      )
      .setOrigin(0);

    this._ui = { scoreText: this.scoreText };
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

  // Pause logic unchanged
  listenToEvents()  {
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

  countDown(){
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
    const pauseButton = this.add
      .image(
        this.config.width * this.scaleMultiplier - 10 * this.scaleMultiplier,
        this.config.height * this.scaleMultiplier - 10 * this.scaleMultiplier,
        "pause"
      )
      .setScale(3 * this.scaleMultiplier)
      .setOrigin(1)
      .setInteractive();

    pauseButton.on("pointerdown", () => {
      this.isPaused = true;
      if (this.sound.context.state === "suspended") {
        this.sound.context.resume();
      }
      if (this.bgMusic && this.bgMusic.isPlaying) {
        this.bgMusic.pause();
      }
      this.scene.pause();
      this.scene.launch("PauseScene", { config: this.config });
    });

    this._ui.pauseButton = pauseButton;
  }

  checkGameStatus() {
    if (!this.bird || !this.bird.active) return;

    if (this.spaceKey.isDown) this.flap();

    const birdBounds = this.bird.getBounds();
    if (birdBounds.bottom >= this.config.height * this.scaleMultiplier ||
        birdBounds.top <= 0) {
      this.gameOver();
    }
  }

  createPipes() {
    this.pipes = this.physics.add.group();

    for (let i = 0; i < PIPES_TO_RENDER; i++) {
      const upperPipe = this.pipes.create(0, 0, "pipe").setImmovable(true).setOrigin(0, 1);
      const lowerPipe = this.pipes.create(0, 0, "pipe").setImmovable(true).setOrigin(0, 0);

      upperPipe.setScale(this.scaleMultiplier);
      lowerPipe.setScale(this.scaleMultiplier);
      upperPipe.refreshBody();
      lowerPipe.refreshBody();

      this.placePipe(upperPipe, lowerPipe);
    }

    this.pipes.setVelocityX(-200 * this.scaleMultiplier);
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
    const diff = this.difficulties[this.currentDifficulty];
    const rightMostX = this.getRightMostPipe();

    const vDist = Phaser.Math.Between(...diff.pipeVerticalDistanceRange);
    const vPos = Phaser.Math.Between(
      20 * this.scaleMultiplier,
      this.config.height * this.scaleMultiplier - 20 * this.scaleMultiplier - vDist
    );

    const hDist = Phaser.Math.Between(...diff.pipeHorizontalDistanceRange);

    uPipe.x = rightMostX + hDist;
    uPipe.y = vPos;

    lPipe.x = uPipe.x;
    lPipe.y = uPipe.y + vDist;

    const centerY = uPipe.y + vDist / 2;
    this.placeCollectible(uPipe.x + 50 * this.scaleMultiplier, centerY);
  }

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


  recyclePipes(){
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

  saveBestScore()  {
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
    this.scoreText.setText(`Score: ${this.score}`)}
}

export default PlayScene;
