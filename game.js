var game
var gameOptions = {
  tileSize: 200,
  tileSpacing: 20,
  boardSize: {
    rows: 4,
    cols: 4
  },
  tweenSpeed: 200,
  swipeMaxTime: 1000,
  swipeMinDistance: 20,
  swipeMinNormal: 0.85
}

const LEFT = 0;
const RIGHT = 1;
const UP = 2;
const DOWN = 3;

window.onload = () => {
  var gameConfig = {
    width: gameOptions.boardSize.cols * (gameOptions.tileSize + gameOptions.tileSpacing) + gameOptions.tileSpacing,
    height: gameOptions.boardSize.rows * (gameOptions.tileSize + gameOptions.tileSpacing) + gameOptions.tileSpacing,
    backgroundColor: 0xecf0f1,
    scene: [bootGame, playGame]
  }
  
  game = new Phaser.Game(gameConfig)
  window.focus();
  resizeGame();
  window.addEventListener("resize", resizeGame);


}

class playGame extends Phaser.Scene{
  constructor(){
      super("PlayGame")
  }

  create() {
    this.canMove = false
    this.boardArray = []

    for (let i = 0; i < 4; i++) {
      this.boardArray[i] = []
      for (let j = 0; j < 4; j++) {
        var tilePosition = this.getTilePosition(i, j)
          this.add.image(tilePosition.x, tilePosition.y,"emptytile")
          var tile = this.add.image(tilePosition.x, tilePosition.y, "tiles", 0)
          tile.visible = false
          this.boardArray[i][j] = {
            tileValue: 0,
            tileSprite: tile
          }
      }
    }

    this.addTile()
    this.addTile()

    this.input.keyboard.on("keydown", this.handleKey, this)
    this.input.on("pointerup", this.handleSwipe, this)
  }

  getTilePosition(row, col){
    var posX = gameOptions.tileSpacing * (col + 1) + gameOptions.tileSize * (col + 0.5)
    var posY = gameOptions.tileSpacing * (row + 1) + gameOptions.tileSize * (row + 0.5)

    return new Phaser.Geom.Point(posX, posY)
  }

  addTile(){
    var emptyTiles = []
    for (let i = 0; i < gameOptions.boardSize.rows; i++) {
      for (let j = 0; j < gameOptions.boardSize.cols; j++) {
        if (this.boardArray[i][j].tileValue == 0) {
          emptyTiles.push({
            row: i,
            col: j
          })
        }
      }
    }

    if (emptyTiles.length > 0) {
      var chosenTile = Phaser.Utils.Array.GetRandom(emptyTiles)
      this.boardArray[chosenTile.row][chosenTile.col].tileValue = 1;
      this.boardArray[chosenTile.row][chosenTile.col].tileSprite.visible = true;
      this.boardArray[chosenTile.row][chosenTile.col].tileSprite.setFrame(0);
      this.boardArray[chosenTile.row][chosenTile.col].tileSprite.alpha = 0

      this.tweens.add({
        targets: [this.boardArray[chosenTile.row][chosenTile.col].tileSprite],
        alpha: 1,
        duration: gameOptions.tweenSpeed,
        callbackScope: this,
        onComplete: function(){
          console.log("tween completed")
          this.canMove = true
        }
      })

    }
  }

  handleKey(e){
    if (this.canMove) {
      switch (e.code) {
        case "KeyA":
        case "ArrowLeft":
          this.makeMove(LEFT);
          break;
        case "KeyD":
        case "ArrowRight":
          this.makeMove(RIGHT);
          break;
        case "KeyW":
        case "ArrowUp":
          this.makeMove(UP);
          break;
        case "KeyS":
        case "ArrowDown":
          this.makeMove(DOWN);
          break;
      }
    }
  }

  makeMove(d) {
    var dRow = (d == LEFT || d == RIGHT) ? 0 : d == UP ? -1 : 1;
    var dCol = (d == UP || d == DOWN) ? 0 : d == LEFT ? -1 : 1;
    this.canMove = false;
    for (var i = 0; i < gameOptions.boardSize.rows; i++) {
      for (var j = 0; j < gameOptions.boardSize.cols; j++) {
        var curRow = dRow == 1 ? (gameOptions.boardSize.rows - 1) - i : i;
        var curCol = dCol == 1 ? (gameOptions.boardSize.cols - 1) - j : j;
        var tileValue = this.boardArray[curRow][curCol].tileValue;
        if (tileValue != 0) {
          var newPos = this.getTilePosition(curRow + dRow, curCol + dCol);
          this.boardArray[curRow][curCol].tileSprite.x = newPos.x;
          this.boardArray[curRow][curCol].tileSprite.y = newPos.y;
        }
      }
    }
  }

  handleSwipe(e) {
    if (this.canMove) {
      var swipeTime = e.upTime - e.downTime;
      var fastEnough = swipeTime < gameOptions.swipeMaxTime;
      var swipe = new Phaser.Geom.Point(e.upX - e.downX, e.upY - e.downY);
      var swipeMagnitude = Phaser.Geom.Point.GetMagnitude(swipe);
      var longEnough = swipeMagnitude > gameOptions.swipeMinDistance;
      if (longEnough && fastEnough) {
        Phaser.Geom.Point.SetMagnitude(swipe, 1);
        if (swipe.x > gameOptions.swipeMinNormal) {
          this.makeMove(RIGHT);
        }
        if (swipe.x < -gameOptions.swipeMinNormal) {
          this.makeMove(LEFT);
        }
        if (swipe.y > gameOptions.swipeMinNormal) {
          this.makeMove(DOWN);
        }
        if (swipe.y < -gameOptions.swipeMinNormal) {
          this.makeMove(UP);
        }
      }
    }
  }
}

class bootGame extends Phaser.Scene{
    constructor(){
        super("BootGame")
    }

    preload(){
        this.load.image("emptytile", "assets/sprites/emptytile.png")
        this.load.spritesheet("tiles", "assets/sprites/tiles.png", {
          frameWidth: gameOptions.tileSize,
          frameHeight: gameOptions.tileSize
        })
    }

    create(){
        console.log("game is booting...")
        this.scene.start("PlayGame")
    }
}

function resizeGame() {
    var canvas = document.querySelector("canvas");
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var windowRatio = windowWidth / windowHeight;
    var gameRatio = game.config.width / game.config.height;
    if (windowRatio < gameRatio) {
        canvas.style.width = windowWidth + "px";
        canvas.style.height = (windowWidth / gameRatio) + "px";
    }
    else {
        canvas.style.width = (windowHeight * gameRatio) + "px";
        canvas.style.height = windowHeight + "px";
    }
}
