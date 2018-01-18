const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// define ball
const ballRadius = 5;

// set ball origin
let x = canvas.width / 2;
let y = canvas.height - 30;

// interating ball coordin after drawn frame
let velx = 0.2;
let vely = -0.2;

let lastx = x,
    lasty = y,
    posx = x,
    posy = y,
    limit = 300, // how far the box can go before it switches direction
    lastFrameTimeMs = 0, // The last time the loop was run
    maxFPS = 60, // The maximum FPS we want to allow
    delta = 0, // Re-adjust the velocity now that it's not dependent on FPS
    fps = 60,
    framesThisSecond = 0,
    lastFpsUpdate = 0,
    timestep = 1000 / 60, // We want to simulate 1000 ms / 60 FPS = 16.667 ms per frame every time we run update()
    numUpdateSteps = 0,
    fpsDisplay = document.getElementById('fpsDisplay'),
    timerDisplay = document.getElementById('timerDisplay'),
    seconds = 0,
    pastFrameSeconds = 0,
    initTimestamp = 0,
    boxLastPos = 10,
    running = false,
    started = false;

// define paddle
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;

// define bricks
const brickRowCount = 6;
const brickColumnCount = 8;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
let brickOffsetTop = 30;
const brickOffsetLeft = 30;

// define score
let score = 0;

// define lives
let lives = 3;

// brick postition array
const bricks = [];
for (let c = 0; c < brickColumnCount; c += 1) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r += 1) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

function drawBall() {
  ctx.beginPath();
  // context.arc(x,y,r,sAngle,eAngle,counterclockwise);
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#0095DD';
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = '#0095DD';
  ctx.fill();
  ctx.closePath();
}

function drawBricks(seconds) {
  let roundedSeconds = Math.round(seconds);
  if( (roundedSeconds % 10) == 0 && roundedSeconds !== pastFrameSeconds){
   brickOffsetTop += brickOffsetTop;
  }
  pastFrameSeconds = roundedSeconds;
  for (let c = 0; c < brickColumnCount; c += 1) {
    for (let r = 0; r < brickRowCount; r += 1) {
      if (bricks[c][r].status === 1) {
        const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
        const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = '#0095DD';
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

function update(delta) {
  lastx = posx; // save the position from the last update
  lasty = posy; // save the position from the last update

  posx += velx * delta;
  posy += vely * delta;

  // ball boundries - left || right
  if (posx + velx < ballRadius || posx + velx > canvas.width - ballRadius) {
    velx = -velx;
  }

  // ball boundries - top || bottom 
  if (posy + vely < ballRadius) {
    vely = -vely;
  } else if (posy + vely > canvas.height - ballRadius) {
    lives -= 1;
    if (!lives) {
      stopGame();
    } else {
      x = canvas.width / 2;
      y = canvas.height - 30;
      paddleX = (canvas.width - paddleWidth) / 2;
    }
  } else if (posy + vely > canvas.height - ballRadius - paddleHeight) {
    // paddle & ball collision detection
    if (posx > paddleX && posx < paddleX + paddleWidth) {
      vely = -vely;
    }
  }

  // paddle moving logic (with boundries)
  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }
}

function draw(interp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ball moving logic
  x = lastx + ((posx - lastx) * interp);
  y = lasty + ((posy - lasty) * interp);

  drawBall();
  drawPaddle();
  drawBricks(seconds);
  collisionDetection();

  fpsDisplay.textContent = Math.round(fps) + ' FPS'; // display the FPS
  timerDisplay.textContent = seconds; //display the time
}

function panic() {
  delta = 0; // discard the unsimulated time
  // ... snap the player to the authoritative state
}

function stopGame() {
    running = false;
    started = false;
    console.log(frameID)
    cancelAnimationFrame(frameID);
}

function startGame() {
  if (!started) { // don't request multiple frames
    started = true;
    // Use High Resolution Timer to get startTime
    initTimestamp = performance.now();
    // Dummy frame to get our timestamps and initial drawing right.
    // Track the frame ID so we can cancel it if we stop quickly.
    frameID = requestAnimationFrame(function(timestamp) {
      draw(1); // initial draw
      running = true;
      // reset some time tracking variables
      lastFrameTimeMs = timestamp;
      lastFpsUpdate = timestamp;
      framesThisSecond = 0;
      // actuall start the main loop
      frameID = requestAnimationFrame(mainLoop);
    });
    console.log(frameID)
  }
}

function keyDownHandler(e) {
  if (e.keyCode === 39) {
    rightPressed = true;
  } else if (e.keyCode === 37) {
    leftPressed = true;
  }
}
document.addEventListener('keydown', keyDownHandler, false);

function keyUpHandler(e) {
  if (e.keyCode === 39) {
    rightPressed = false;
  } else if (e.keyCode === 37) {
    leftPressed = false;
  }
}
document.addEventListener('keyup', keyUpHandler, false);

function mouseMoveHandler(e) {
  const relativeX = e.clientX - canvas.offsetLeft;
  if (relativeX > 0 && relativeX < canvas.width) {
    paddleX = relativeX - (paddleWidth / 2);
  }
}
document.addEventListener('mousemove', mouseMoveHandler, false);

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c += 1) {
    for (let r = 0; r < brickRowCount; r += 1) {
      const b = bricks[c][r];
      if (b.status === 1) {
        if (x > b.x && x < (b.x + brickWidth) && y > b.y && (y < b.y + brickHeight)) {
          vely = -vely;
          b.status = 0;
          score += 1;
          if (score === (brickColumnCount * brickRowCount)) {
            // alert("You Win");
            // document.location.reload();
          }
        }
      }
    }
  }
}

function gameTimer(timestamp) {
  const currTime = new Date(timestamp);
  const startTime = new Date(initTimestamp);
  let seconds = (currTime.getTime() - startTime.getTime())/1000;
  return seconds;
}

function mainLoop(timestamp) {
  seconds = gameTimer(timestamp);

  // Throttle the frame rate.    
  if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
      requestAnimationFrame(mainLoop);
      return;
  }

  // Track the accumulated time that hasn't been simulated yet
  delta += timestamp - lastFrameTimeMs; // note += here
  lastFrameTimeMs = timestamp;

  if (timestamp > lastFpsUpdate + 1000) { // update every second
    fps = 0.25 * framesThisSecond + (1 - 0.25) * fps; // compute the new FPS

    lastFpsUpdate = timestamp;
    framesThisSecond = 0;
  }
  framesThisSecond++;

  // Simulate the total elapsed time in fixed-size chunks
  while (delta >= timestep) {
    update(timestep);
    delta -= timestep;
    // Sanity check
    if (++numUpdateSteps >= 240) {
      panic(); // fix things
      break; // bail out
    }
  }
  draw(delta / timestep);

  frameID = requestAnimationFrame(mainLoop);
}
