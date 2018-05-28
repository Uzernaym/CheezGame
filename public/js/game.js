var gamePieces = {};
var playerFont = "20px Arial";
var $canvas = document.querySelector('canvas');
var context = $canvas.getContext('2d');
$canvas.width = window.innerWidth;
$canvas.height = window.innerHeight;
var keys = [];
var velY = 0;
var velX = 0;
var speed = 5;
var friction = 0.98;

//Scoring Variables
var score = 1;
var scoreFont = "50px Arial";
var scorePosition = {x: $canvas.width/2 - 15, y:100};
var timer = 0;
var timerFont = "20px Arial";
var timerPosition = {x: 60, y: $canvas.height - 20};
var textColor = "Black";

//Random Color
var colors = ['red', 'green', 'blue', 'orange'];
var playerColor = colors[playerNames.length % 4];
//var playerColor = colors[Math.floor(Math.random() * colors.length)];

socket.on('playerUpdate', updatePlayers);

function updatePlayers(players) {

	var playerNames = Object.keys(players);
	var playerColor = colors[playerNames.length % 4];

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
		context.fillText(playerName , fontPieceX, fontPieceY + 2);
	});

}

function animate() {
	timer += 1/60;
	score += 1/60;
	score = Math.max(score, 0);

	context.clearRect(0, 0, $canvas.width, $canvas.height);
	updatePlayerPosition();

	drawPlayers();

	drawScore()

	window.requestAnimationFrame(animate);
}

function updatePlayerPosition() {

	var gamePiece = gamePieces[user];

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

    if (gamePiece.x >= $canvas.width - 60) {
        gamePiece.x = $canvas.width - 60;
    } else if (gamePiece.x <= 0) {
        gamePiece.x = 0;
    }

    if (gamePiece.y > $canvas.height - 60) {
        gamePiece.y = $canvas.height - 60;
    } else if (gamePiece.y <= 0) {
        gamePiece.y = 0;
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
