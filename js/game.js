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
    const digitWidth = 3 * this.pixelSize;
    const numberWidth = numbers.length * digitWidth + (numbers.length - 1) * this.pixelSize;
    
    for (let i = 0, numLen = numbers.length; i < numLen; i++) {
      for (let j = 0, binLen = this.digits[numbers[i]].length; j < binLen; j++) {
        if (this.digits[numbers[i]][j] == 0) continue;

        const x = j % 3 * this.pixelSize + i * (digitWidth + this.pixelSize);
        const y = Math.floor(j / 3) * this.pixelSize;

        context.fillRect(
          this.position.x - digitWidth / 2 - numberWidth / 2 + Math.floor(x),
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
    this.entities['ball'].position = new Vector2(WIDTH / 2, HEIGHT / 2);
    this.entities['ball'].velocity = new Vector2(3, 3);

    this.entities['player'].position = new Vector2(20, HEIGHT / 2);
    this.entities['opponent'].position = new Vector2(WIDTH - 20, HEIGHT / 2);
  }
}
