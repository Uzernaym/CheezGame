//Canvas Variables
var $canvas = document.querySelector('canvas');
var context = $canvas.getContext("2d");
$canvas.width = window.innerWidth;
$canvas.height = window.innerHeight;

//Scoring Variables
var score = 1;
var scoreFont = "50px Arial";
var scorePosition = {x: $canvas.width/2 - 15, y:100};
var timer = 0;
var timerFont = "20px Arial";
var timerPosition = {x: 20, y: $canvas.height - 20};
var textColor = "Black";

//Bird Variables
var x = $canvas.width/2;
var y = $canvas.height/2;
var r = $canvas.width/40;
var startAngle = 0;
var endAngle = 2*Math.PI;
var step = 1;
var ySpeed = 0;
var birdColor1;
var birdColor2;
var birdColor3;

//Pipe Variables
var worldSpeed = $canvas.width/500;
var pipeSpacing = $canvas.width/2.5;
var pipeWidth = $canvas.width/20;
var numberOfGapLocations = 5;
var gapHeight = $canvas.height/numberOfGapLocations;
var pipeColor = '#228b22';
var pipes = [];
var pipeCount = 5;
var mySound;

function startGame() {
    generatePipes();
    window.requestAnimationFrame(animate);
    document.addEventListener('keydown', interact);
}

function getRandomGapPosition() {
    return parseInt(Math.random()*(numberOfGapLocations - 1))*gapHeight;
}

function generatePipes() {
    var position = $canvas.width - pipeWidth;
    while(pipes.length < 5) {
        pipes.push({
            pipeX: position
            , gapY: parseInt(Math.random()*(numberOfGapLocations - 1))*gapHeight
        });
        position += pipeSpacing;
    }
}

function interact(e) {
    if(e.key === 'w' | e.key ==='space') {
        ySpeed -= Math.abs(ySpeed += 5);
    }
    if(e.key === 's') {
        ySpeed += 5;
    }
    if(e.key === 'q') {
        r -= 1;
    }
    if(e.key === 'e') {
        r += 1;
    }
    if(e.key === 'r') {
        window.location.reload(false);
    }
    if(e.key === 'm') {
        r -= 1;
    }
}

function checkCollisions() {
    var hasCollided = pipes.some(function(pipe) {
        var circleRight = x + r;
        var circleTop = y - r;
        var circleBottom = y + r;
        var pipeLeftEdge = pipe.pipeX;
        var pipeRightEdge = pipe.pipeX + pipeWidth;
        var gapTopEdge = pipe.gapY;
        var gapBottomEdge = pipe.gapY + gapHeight;
        var isInsidePipe = circleRight > pipeLeftEdge && circleRight < pipeRightEdge;
        var isInsideGap = isInsidePipe && circleTop > gapTopEdge && circleBottom < gapBottomEdge;

        return isInsidePipe && !isInsideGap;
    });
    return hasCollided;
}

function drawScore() {
    context.fillStyle = textColor;
    context.font = timerFont;
    context.fillText(`${parseInt(timer)} Seconds`,timerPosition.x, timerPosition.y);

    context.font = scoreFont;
    context.fillText(`${parseInt(score)}` ,scorePosition.x, scorePosition.y);
}

function drawPipes() {
    pipes.forEach(function(pipe) {
        context.beginPath();
        context.fillStyle = pipeColor;
        context.rect(Math.floor(pipe.pipeX),0,Math.ceil(pipeWidth), $canvas.height);
        context.fill();
        context.closePath();
        context.clearRect(Math.floor(pipe.pipeX), Math.floor(pipe.gapY), Math.ceil(pipeWidth), Math.ceil(gapHeight));
    });
}

function drawBird() {
    context.beginPath();
    context.arc(x, y, r, startAngle, endAngle);
    rad_grad = context.createRadialGradient(x, y, 1, x, y, 1.25*r);
    rad_grad.addColorStop(0, 'Yellow');
    rad_grad.addColorStop(0.9, 'Orange');
    rad_grad.addColorStop(1, 'Black');
    context.fillStyle = rad_grad;
    context.fill();

    birdColor1 = 'Yellow';
    birdColor2 = 'Orange';
    birdColor3 = 'Black';
}

function animateBird() {
    y += ySpeed;

    ySpeed += 0.2;

    if(ySpeed > 10) ySpeed -= 1;
    if(ySpeed <= -20) ySpeed === -20;

    if(y-r < 0)  ySpeed += Math.abs(1.5*ySpeed);
    if(y+r > $canvas.height)  ySpeed -= Math.abs(1.5*ySpeed);
}

function animateWorld() {

    pipes.forEach(function(pipe) {
       pipe.pipeX -= worldSpeed;
    });

    if((pipes[0].pipeX + pipeWidth) < 0 ) {
        pipes.shift();
        pipes.push({
            pipeX: pipes[pipes.length - 1].pipeX + pipeSpacing
            , gapY: getRandomGapPosition()
        });
    }
    drawPipes();
}

function calculateScore(hasCollided) {
    if(hasCollided) {
        score -= 10/60;
        birdColor1 = 'Orange';
        birdColor2 = 'Red';
        birdColor3 = 'Black';
    }
    if(!hasCollided) {
        score += 1/60;
    }
    score = Math.max(score, 0);
}

function checkDeath() {
    if(score === 0) {
        alert('Alina sucks');
        return true;
    }
    return false;
}

function animate() {
    timer += 1/60;

    context.clearRect(0, 0, $canvas.width, $canvas.height);

    animateBird();
    animateWorld();

    var hasCollided = checkCollisions();

    drawPipes();
    drawBird();

    calculateScore(hasCollided);
    drawScore();

    var hasDied = checkDeath();
    if(!hasDied) {
        window.requestAnimationFrame(animate);
    }
}

startGame();
