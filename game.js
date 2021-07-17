const config = {
    width: 600,
    height: 650,
    playerWidth: 10,
    playerHeight: 20,
    criterWidth: 15,
    criterHeight: 15,
    rockWidth: 100,
    rockHeight: 25,
}

let gameState = {
    gameOver: false,
    player: {
        xPosition: 300 - config.playerWidth/2, // Middle minus half width
        yPosition: config.height*(7/8),
    },
    criters: Array(4).fill(null).map(
        (_, columnIdx) => Array(10).fill(null).map(
            (_, rowIdx) => ({xPosition: 10 + rowIdx*config.criterWidth*2, yPosition: 10 + columnIdx * config.criterHeight*2, alive: true})
        )
    ).flat(),
    critersDirection: 1, // +1 right / -1 left
    bullet: {
        xPosition: null,
        yPosition: null,
    },
    rocks: Array(4).fill(null).map((_, idx) => ({
        yPosition: config.height*(6/8), 
        xPosition: 25+(config.rockWidth*1.5*idx), 
        health: 10
    })),
}

const canvas = document.getElementById('canvas');
canvas.height = config.height;
canvas.width = config.width;

const ctx = canvas.getContext('2d');

// Metronome
const id = setInterval(metronome, 20);

function metronome() {

    gameState = moveCriterHorde(gameState);

    gameState = handleCollisions(gameState);

    render(ctx, gameState);

    if (gameState.gameOver){
        clearInterval(id);
        alert('Game Over!')
    }
}

// User Action
window.onkeydown = playerAction;

function render(ctx, state){
    ctx.clearRect(0, 0, config.width, config.height);

    // Player
    const player = state.player;
    ctx.fillStyle = 'black';
    ctx.fillRect(player.xPosition, player.yPosition, config.playerWidth, config.playerHeight);

    // Criters
    for (const criter of gameState.criters) {
        if (criter.alive) {
            ctx.fillStyle = 'blue';
            ctx.fillRect(criter.xPosition, criter.yPosition, config.criterWidth, config.criterHeight);
        }
    }

    // Rocks
    for (const rock of gameState.rocks) {
        if(rock.health) {
            drawRock(ctx, rock.xPosition, rock.yPosition, config.rockWidth, config.rockHeight)
        }
    }
}

function playerAction(e) {
  let playerPosition = gameState.player.xPosition;

  if (e.code === 'ArrowLeft'){
    playerPosition = boundNumber(playerPosition - 10, 0, config.width);
  } else if (e.code === 'ArrowRight') {
      playerPosition = boundNumber(playerPosition+10, 0, config.width-config.playerWidth);
  } else if (e.code === 'Space') {
      // Shoot from position!
  }

  gameState = {
    ...gameState,
      player: {
          ...gameState.player,
          xPosition: playerPosition,
      },
  };
}

function moveCriterHorde(state) {
    let direction = state.critersDirection;
    let newCriters = state.criters.map(c => ({...c, xPosition: c.xPosition + (direction*3)}));

    // Last criter reached end or first criter at beginning, move horde down and flip x direction
    if ((newCriters[newCriters.length-1].xPosition + config.criterWidth >= config.width) || (newCriters[0].xPosition <= 0)) {
        newCriters = newCriters.map(c => ({
            ...c, 
            yPosition: c.yPosition+config.criterHeight,
            xPosition: c.xPosition+(direction*-1*10), // Take a little back to avoid bug
        })
        );
        direction = direction*-1;
    }

    // TODO: Check if any criter reached the bottom, if so end game by changing gameOver property in state

    return {
        ...state,
        criters: newCriters,
        critersDirection: direction,
    }
}

function boundNumber(value, min, max) {
    if (value < min) {
        return 0;
    } else if (value > max) {
        return max;
    }

    return value;
}

function drawRock(ctx, xPosition, yPosition, w, h) {
    ctx.fillStyle = 'red';

    ctx.beginPath();
    ctx.moveTo(xPosition, yPosition);
    ctx.lineTo(xPosition+(w/2), yPosition+h);
    ctx.lineTo(xPosition+w, yPosition);
    ctx.fill();
}

// Parans: Position and dimenstions of two boxes (a and b)
// Return: boolean
function boxesCollide(aX, aY, aW, aH, bX, bY, bW, bH) {
    let horizontalCollide = false;
    let verticalCollide = false;

    if ((bX >= aX && bX <= aX+aW) || (bX+bW >= aX && bX+bW <= aX+aW)) {
        horizontalCollide = true;
    }

    if ((bY >= aY && bY <= aY+aH) || (bY+bH >= aY && bY+bH <= aY+aH)) {
        verticalCollide = true;
    }

    return horizontalCollide && verticalCollide;
}

function handleCollisions(state) {
    // Criters clashing with Rocks
    const newState = {...state}
    const criters = state.criters;
    const rocks = state.rocks;
    const player = state.player;

    for (const [cIdx, c] of criters.entries()) {
        for (const [rIdx, r] of rocks.entries()) {
            if(boxesCollide(
                c.xPosition, 
                c.yPosition, 
                config.criterWidth, 
                config.criterHeight,
                r.xPosition,
                r.yPosition,
                config.rockWidth,
                config.rockHeight,
            )) {
                if (r.health && c.alive) {
                    newState.criters[cIdx].alive = false;
                    newState.rocks[rIdx].health = boundNumber(r.health-2, 0, 10);
                } 
            }
        }

        // Criter hits player (Game Over)
        if (c.alive && boxesCollide(
            c.xPosition, 
            c.yPosition, 
            config.criterWidth, 
            config.criterHeight,
            player.xPosition,
            player.yPosition,
            config.playerWidth,
            config.playerHeight,
        )) {
            newState.gameOver = true;
        }

        // TODO: Bullet hits criter
    }

    return newState;
}

// TODO bullet:

// function that creates bullet

// function that moves bullet and vanishes is when out or hits target

// function that evaluates if bullet hits criter
// Bullet in range between criter position and + width / height

