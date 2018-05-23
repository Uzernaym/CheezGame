var gamePieces = {};
var playerFont = "20px Arial";
var $canvas = document.querySelector('canvas');
var context = $canvas.getContext('2d');
$canvas.width = window.innerWidth;
$canvas.height = window.innerHeight;
var keys = [];

//Scoring Variables
var score = 1;
var scoreFont = "50px Arial";
var scorePosition = {x: $canvas.width/2 - 15, y:100};
var timer = 0;
var timerFont = "20px Arial";
var timerPosition = {x: 60, y: $canvas.height - 20};
var textColor = "Black";

//Bird Variables
/*
var x = $canvas.width/2;
var y = $canvas.height/2;
var r = $canvas.width/40;
var startAngle = 0;
var endAngle = 2*Math.PI;
var step = 1;
var ySpeed = 0;
*/

//Random Color
var colors = ['red', 'green', 'blue', 'orange'];
var playerColor = colors[Math.floor(Math.random() * colors.length)];

socket.on('playerUpdate', updatePlayers);

function updatePlayers(players) {

	var playerNames = Object.keys(players);

	playerNames.forEach(function(playerName) {
		if(playerName === user) return;
		if(!gamePieces[playerName]) {
			createNewPlayer(playerName);
		}

		var player = players[playerName];
		var gamePiece = gamePieces[playerName];
		gamePiece.x = player.x;
		gamePiece.y = player.y;
	});

	var gamePieceNames = Object.keys(gamePieces);
	gamePieceNames.forEach(function(gamePieceName) {
		if(!players[gamePieceName]) {
			delete gamePieces[gamePieceName];
		}
	})

}

function drawScore() {
    context.fillStyle = textColor;
    context.font = timerFont;
    context.fillText(`${parseInt(timer)} Seconds`,timerPosition.x, timerPosition.y);

    context.font = scoreFont;
    context.fillText(`${parseInt(score)}` ,scorePosition.x, scorePosition.y);
}

function createNewPlayer(playerName) {

	var gamePiece = { loaded: false, x: 0, y:0 };
	gamePiece.avatar = new Image();
	gamePiece.avatar.onload = function() {
		gamePiece.loaded = true;
	}
	gamePiece.avatar.src = '/avatar/' + playerName;
	gamePieces[playerName] = gamePiece;

}

/* function animateBird() {
    y += ySpeed;

    ySpeed += 0.2;

    if(ySpeed > 10) ySpeed -= 0.2;
    if(ySpeed <= -20) ySpeed === -20;

    if(y-r < 0)  ySpeed = Math.abs(1.5*ySpeed);
    if(y+r > $canvas.height)  ySpeed -= Math.abs(1.5*ySpeed);
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
}
*/

function drawPlayers() {

	var playerNames = Object.keys(gamePieces);
	var pieceWidth = Math.min($canvas.width, $canvas.height) / 20;

	playerNames.forEach(function(playerName) {
		var gamePiece = gamePieces[playerName];
		var fontPieceX = gamePiece.x + pieceWidth/2;
		var fontPieceY = gamePiece.y + pieceWidth/2;
		if(!gamePiece.loaded) return;
		context.fillStyle = playerColor;
		context.fillRect(gamePiece.x, gamePiece.y, pieceWidth, pieceWidth)
		//context.drawImage(gamePiece.avatar ,gamePiece.x, gamePiece.y, pieceWidth, pieceWidth);
		context.fillStyle = 'white'
		context.textAlign = 'center';
		context.font = playerFont;
		context.fillText(playerName , fontPieceX, fontPieceY);
	});

}

function animate() {
	timer += 1/60;
	score += 1/60;
	score = Math.max(score, 0);

	context.clearRect(0, 0, $canvas.width, $canvas.height);

	//animateBird()

	//drawBird();
	drawPlayers();

	drawScore()
	updatePlayerPosition();
	window.requestAnimationFrame(animate);
}

function updatePlayerPosition(keys) {

	var gamePiece = gamePieces[user];

	var x = 150;
  var y = 150;
  var velY = 0;
  var velX = 0;
  var speed = 2;
  var friction = 0.5;


			if (keys[38]) {
        if (velY > -speed) {
            velY--;
        }
    }

    if (keys[40]) {
        if (velY < speed) {
            velY++;
        }
    }
    if (keys[39]) {
        if (velX < speed) {
            velX++;
        }
    }
    if (keys[37]) {
        if (velX > -speed) {
            velX--;
        }
    }

    velY *= friction;
    gamePiece.y += velY;
    velX *= friction;
    gamePiece.x += velX;

    if (x >= 295) {
        x = 295;
    } else if (x <= 0) {
        x = 0;
    }

    if (y > 295) {
        y = 295;
    } else if (y <= 0) {
        y = 0;
    }

	socket.emit('playerUpdate', {x: gamePiece.x, y: gamePiece.y});

}

document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});

window.requestAnimationFrame(animate);
createNewPlayer(user);
