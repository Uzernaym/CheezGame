var gamePieces = {};
var $canvas = document.querySelector('canvas');
var context = $canvas.getContext('2d');
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

function drawPlayers() {

	var playerNames = Object.keys(gamePieces);
	var pieceWidth = Math.min($canvas.width, $canvas.height) / 25;
	playerNames.forEach(function(playerName) {
		var gamePiece = gamePieces[playerName];
		if(!gamePiece.loaded) return;
		context.drawImage(gamePiece.avatar ,gamePiece.x, gamePiece.y, pieceWidth, pieceWidth);
	});

}

function animate() {
	timer += 1/60;
	score += 1/60;
	score = Math.max(score, 0);

	context.clearRect(0, 0, $canvas.width, $canvas.height);
	drawPlayers();

	drawScore()
	window.requestAnimationFrame(animate);
}

function updatePlayerPosition(e) {

	var gamePiece = gamePieces[user];
	var xstep = 10;
	var ystep = 10;
	switch(e.key) {
		case 'a':
			gamePiece.x -= xstep;
			break;
		case 'd':
			gamePiece.x += xstep;
			break;
		case 's':
			gamePiece.y += ystep;
			break;
		case 'w':
			gamePiece.y -= ystep;
			break;
		default:
			return;
	}
	socket.emit('playerUpdate', {x: gamePiece.x, y: gamePiece.y});

}

document.body.addEventListener('keydown', updatePlayerPosition);
window.requestAnimationFrame(animate);
createNewPlayer(user);
