class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

class Entity {
  constructor(width, height) {
    this.position = new Vector2();
    this.size = new Vector2(width, height);
    this.velocity = new Vector2();
  }

  draw(context, nextFrame) {
    context.fillStyle = 'white';
    context.fillRect(
      this.position.x + this.velocity.x * nextFrame - this.size.x / 2,
      this.position.y + this.velocity.y * nextFrame - this.size.y / 2,
      this.size.x, this.size.y
    );
  }

  get left() {
    return this.position.x - this.size.x / 2;
  }

  get right() {
    return this.position.x + this.size.x / 2;
  }

  get top() {
    return this.position.y - this.size.y / 2;
  }

  get bottom() {
    return this.position.y + this.size.y / 2;
  }

  isColliding(entity ){
    return this.left < entity.right &&
      this.right > entity.left &&
      this.top < entity.bottom &&
      this.bottom > entity.top;
  }
}

class Ball extends Entity {
  constructor() {
    super(10, 10);
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.bottom > HEIGHT || this.top < 0) this.velocity.y *= -1;
  }
}

class Player extends Entity {
  constructor() {
    super(10, 75);
    this.velocity.y = 2;
    this.isMovingUp = false;
    this.isMovingDown = false;
    this.score = 0;
  }

  update() {
    if (this.isMovingUp && this.top > this.size.x)
      this.position.y -= this.velocity.y;
    if (this.isMovingDown && this.bottom < HEIGHT - this.size.x)
      this.position.y += this.velocity.y;
  }
}

class Opponent extends Player {
  constructor(entity) {
    super();
    this.entityToFollow = entity;
  }

  update() {
    super.update();

    this.isMovingUp = this.entityToFollow.position.y < this.position.y;
    this.isMovingDown = this.entityToFollow.position.y > this.position.y;
  }
}

class Score {
  constructor(player) {
    this.player = player;
    this.pixelSize = 10;
    this.position = new Vector2();
    this.currentScore = this.player.score;
    this.digitWidth = 3 * this.pixelSize;

    this.digits = [
      '111101101101111',
      '010010010010010',
      '111001111100111',
      '111001011001111',
      '101101111001001',
      '111100111001111',
      '111100111101111',
      '111001001001001',
      '111101111101111',
      '111101111001111'
    ];
  }

  update() {
    if (this.player.score > this.currentScore)
      this.currentScore = this.player.score;
  }

  draw(context) {
    context.fillStyle = 'white';

    const numbers = this.currentScore.toString().split('');
    const numberWidth = numbers.length * this.digitWidth + (numbers.length - 1) * this.pixelSize;
    
    for (let i = 0, numLen = numbers.length; i < numLen; i++) {
      for (let j = 0, binLen = this.digits[numbers[i]].length; j < binLen; j++) {
        if (this.digits[numbers[i]][j] == 0) continue;

        const x = j % 3 * this.pixelSize + i * (this.digitWidth + this.pixelSize);
        const y = Math.floor(j / 3) * this.pixelSize;

        context.fillRect(
          Math.floor(this.position.x - this.digitWidth / 2 - numberWidth / 2 + x),
          this.position.y + 10 + y,
          this.pixelSize, this.pixelSize
        );
      }
    }
  }
}

class Game {
  constructor() {
    const canvas = document.getElementById('game');;
    this.context = canvas.getContext('2d');

    this.entities = {};
    this.entities['ball'] = new Ball();
    this.entities['player'] = new Player();
    this.entities['opponent'] = new Opponent(this.entities['ball']);

    this.entities['playerScore'] = new Score(this.entities['player']);
    this.entities['opponentScore'] = new Score(this.entities['opponent']);

    this.entities['playerScore'].position.x = WIDTH / 3
    this.entities['opponentScore'].position.x = WIDTH - WIDTH / 3;

    this.reset();
  }

  processEvents(event) {
    if (event.type === 'keydown') {
      if (event.keyCode == 87) this.entities['player'].isMovingUp = true;
      if (event.keyCode == 83) this.entities['player'].isMovingDown = true;
    } else if (event.type === 'keyup') {
      if (event.keyCode == 87) this.entities['player'].isMovingUp = false;
      if (event.keyCode == 83) this.entities['player'].isMovingDown = false;
    }
  }

  update() {
    for (const key in this.entities)
      this.entities[key].update();

    if (this.entities['ball'].isColliding(this.entities['player']) ||
        this.entities['ball'].isColliding(this.entities['opponent'])) {
      this.entities['ball'].velocity.x *= -1;
    }

    if (this.entities['ball'].right > WIDTH || this.entities['ball'].left < 0) {
      const winner = this.entities['ball'].position.x < WIDTH / 2 ? 'opponent' : 'player';
      this.entities[winner].score++;
      this.reset();
    }
  }

  render(nextFrame) {
    this.context.fillStyle = 'black';
    this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);

    for (const key in this.entities)
      this.entities[key].draw(this.context, nextFrame);
  }

  reset() {
    const ballDirection = this.entities['ball'].position.x < WIDTH / 2 ? -1 : 1;

    this.entities['ball'].position = new Vector2(WIDTH / 2, HEIGHT / 2);
    this.entities['ball'].velocity = new Vector2(3 * ballDirection, 3);

    this.entities['player'].position = new Vector2(20, HEIGHT / 2);
    this.entities['opponent'].position = new Vector2(WIDTH - 20, HEIGHT / 2);
  }
}

// class Vector2 {
//   constructor(x = 0, y = 0) {
//     this.x = x;
//     this.y = y;
//   }
// }

// class Rectangle {
//   constructor(width, height) {
//     this.position = new Vector2();
//     this.size = new Vector2(width, height);
//   }

//   draw(context) {
//     context.fillStyle = 'white';
//     context.fillRect(
//       this.position.x - this.size.x / 2,
//       this.position.y - this.size.y / 2,
//       this.size.x,
//       this.size.y
//     );
//   }

//   get left() {
//     return this.position.x - this.size.x / 2;
//   }

//   get right() {
//     return this.position.x + this.size.x / 2;
//   }

//   get top() {
//     return this.position.y - this.size.y / 2;
//   }

//   get bottom() {
//     return this.position.y + this.size.y / 2;
//   }
// }

// class Ball extends Rectangle {
//   constructor() {
//     super(10, 10);
//     this.velocity = 0;
//     this.angle = 0;
//   }

//   isColliding(rectangle) {
//     return this.left < rectangle.right &&
//       this.right > rectangle.left &&
//       this.top < rectangle.bottom &&
//       this.bottom > rectangle.top;
//   }
// }

// class Player extends Rectangle {
//   constructor() {
//     super(10, 75);
//     this.velocity = new Vector2();
//   }
// }

// class Game {
//   constructor() {
//     let canvas = document.getElementById('game');
//     this.width = canvas.width;
//     this.height = canvas.height;
//     this.context = canvas.getContext('2d');

//     this.movementSpeed = 75;
//     this.ballSpeed = 175;
//     this.maxBallAngle = 45 * Math.PI / 180;

//     this.ball = new Ball();
//     this.player = new Player();
//     this.opponent = new Player();

//     this.gameObjects = [];
//     this.gameObjects.push(this.ball);
//     this.gameObjects.push(this.player);
//     this.gameObjects.push(this.opponent);

//     this.keyboard = {};

//     this.reset();
//   }

//   processEvents(event) {
//     if (event.type === 'keydown')
//       this.keyboard[event.keyCode] = true;
//     else if (event.type === 'keyup')
//       this.keyboard[event.keyCode] = false;
//   }

//   update(deltaTime) {
//     this.ball.position.x += Math.cos(this.ball.angle) * this.ball.velocity * deltaTime;
//     this.ball.position.y += Math.sin(this.ball.angle) * this.ball.velocity * deltaTime;

//     if (this.isUpKeyPressed() && this.isAllowedToMoveUp(this.player))
//       this.player.position.y -= this.movementSpeed * deltaTime;
//     if (this.isDownKeyPressed() && this.isAllowedToMoveDown(this.player))
//       this.player.position.y += this.movementSpeed * deltaTime;

//     if (this.ball.position.y < this.opponent.position.y && this.isAllowedToMoveUp(this.opponent))
//       this.opponent.position.y -= this.movementSpeed * deltaTime;
//     if (this.ball.position.y > this.opponent.position.y  && this.isAllowedToMoveDown(this.opponent))
//       this.opponent.position.y += this.movementSpeed * deltaTime;

//     if (this.ball.left < 0 || this.ball.right > this.width) {
//       this.reset();
//       return;
//     } else if (this.ball.top < 0) {
//       this.ball.position.y -= this.ball.top;
//       this.ball.angle = -this.ball.angle;
//     } else if (this.ball.bottom > this.height) {
//       this.ball.position.y -= this.ball.bottom - this.height;
//       this.ball.angle = -this.ball.angle;
//     }

//     if (this.ball.isColliding(this.player)) {
//       this.ball.position.x -= this.ball.left - this.player.right;

//       let angle = this.getAngle(this.ball, this.player);

//       if (this.isUpKeyPressed() || this.isDownKeyPressed())
//         this.ball.velocity = this.calculateBallSpeed(angle);

//       this.ball.angle = this.limitAngleToMaximum(angle);
//     } else if (this.ball.isColliding(this.opponent)) {
//       this.ball.position.x -= this.ball.right - this.opponent.left;

//       let angle = this.getAngle(this.ball, this.opponent);
//       this.ball.velocity = this.calculateBallSpeed(angle);
//       this.ball.angle = this.limitAngleToMaximum(angle) - Math.PI;
//     }
//   }

//   draw() {
//     this.context.fillStyle = 'black';
//     this.context.fillRect(0, 0, this.width, this.height);

//     for (let i in this.gameObjects)
//       this.gameObjects[i].draw(this.context);
//   }

//   reset() {
//     this.ball.position.x = this.width / 2;
//     this.ball.position.y = this.height / 2;
//     this.ball.velocity = this.ballSpeed;
//     this.ball.angle = 0;

//     this.player.position.x = 20;
//     this.player.position.y = this.height / 2;

//     this.opponent.position.x = this.width - 20;
//     this.opponent.position.y = this.height / 2;
//   }

//   isUpKeyPressed() {
//     return this.keyboard[87] || this.keyboard[38];
//   }

//   isDownKeyPressed() {
//     return this.keyboard[83] || this.keyboard[40];
//   }

//   isAllowedToMoveUp(rectangle) {
//     return rectangle.top > rectangle.size.x;
//   }

//   isAllowedToMoveDown(rectangle) {
//     return rectangle.bottom < this.height - rectangle.size.x;
//   }

//   getAngle(rectangle1, rectangle2) {
//     let x = rectangle1.position.x - rectangle2.position.x;
//     let y = rectangle1.position.y - rectangle2.position.y;
//     return Math.atan(y / x);
//   }

//   calculateBallSpeed(angle) {
//     return (1 + Math.abs(angle)) * this.ballSpeed;
//   }

//   limitAngleToMaximum(angle) {
//     if (angle < -this.maxBallAngle) angle = -this.maxBallAngle;
//     else if (angle > this.maxBallAngle) angle = this.maxBallAngle;
//     return angle;
//   }
// }
