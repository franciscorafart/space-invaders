const config = {
    width: 600,
    height: 400,
    playerWidth: 10,
    playerHeight: 20,
    criterWidth: 15,
    criterHeight: 15,
}

let gameState = {
    gameOver: false,
    player: {
        xPosition: 300 - config.playerWidth/2, // Middle minus half width
    },
    criters: Array(4).fill(null).map(
        (_, yIdx) => Array(10).fill(null).map(
            (_, idx) => ({xPosition: 10 + idx*config.criterWidth*2, yPosition: 10 + yIdx * config.criterHeight*2, alive: true})
        )
    ).flat(),
    critersDirection: 1,
    bullet: {
        xPosition: null,
        yPosition: null,
    }
}

let stateCount = 0;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Metronome
const id = setInterval(metronome, 20);

function metronome() {

    gameState = moveCriterHorde(gameState);

    // TODO: Evaluate collisions, bullets, and kill criters

    render(ctx, gameState);

    if (gameState.gameOver){
        clearInterval(id);
    }
}

// User Action
window.onkeydown = playerAction;

function render(ctx, state){
    ctx.clearRect(0, 0, config.width, config.height);

    // Player
    const playerPosition = state.player.xPosition;
    ctx.fillStyle = 'black';
    ctx.fillRect(playerPosition, 380, config.playerWidth, config.playerHeight);

    // Criters
    for (const criter of gameState.criters) {
        if (criter.alive) {
            ctx.fillStyle = 'blue';
            ctx.fillRect(criter.xPosition, criter.yPosition, config.criterWidth, config.criterHeight);
        }
    }
}

function playerAction(e) {
  console.log(` ${e.code}`);
  let playerPosition = gameState.player.xPosition;

  if (e.code === 'ArrowLeft'){
    playerPosition = boundPosition(playerPosition - 10, 0, config.width);
  } else if (e.code === 'ArrowRight') {
      playerPosition = boundPosition(playerPosition+10, 0, config.width-config.playerWidth);
  } else if (e.code === 'Space') {
      // Shoot from position!
  }

  gameState = {
    ...gameState,
      player: {
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

function boundPosition(position, min, max) {
    if (position < min) {
        return 0;
    } else if (position > max) {
        return max;
    }

    return position;
}

// function that evaluates if bullet hits criter
// Bullet in range between criter position and + width / height

