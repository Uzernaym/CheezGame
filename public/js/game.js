var gamePieces = {};
var playerFont = "15px Arial";
var $canvas = document.querySelector('canvas');
var context = $canvas.getContext('2d');
$canvas.width = window.innerWidth;
$canvas.height = window.innerHeight;
var keys = [];
var velY = 0;
var velX = 0;
var speed = 5;
var friction = 0.98;
var pieceWidth = 15;

//World and Viewport Variables

//Object Variables
var objectSprite = new Image();
imageObj.src = 'https://orig00.deviantart.net/10d0/f/2010/311/f/0/rock_planet_sprite_by_fidgetwidget-d32erpc.png';
var objectsSize = [3, 5, 10];
var objectSpeed = [0.1, 0.5, 1, 1.5, 2.5, 3]
var objects = [];

//Scoring Variables
var score = 1;
var scoreFont = "50px Arial";
var scorePosition = {x: $canvas.width/2, y:100};
var timer = 0;
var timerFont = "20px Arial";
var timerPosition = {x: 60, y: $canvas.height + 10};
var textColor = "White";

//Powahs
var bigboomcooldown = 0.5;
var bigboomcooldowntime = 5000;

//Random Color
var colors = ['red', 'green', 'blue', 'orange'];
var playerColor = colors[Math.floor(Math.random() * colors.length)];



socket.on('playerUpdate', updatePlayers);

function drawObjects() {
	objects.forEach(function(object) {
		context.beginPath();
		context.fillStyle = playerColor;
		context.arc(objects.x, objects.y, objectsSize, 0, 2 * Math.PI, false)
		context.fill()
		context.drawImage(objectSprite , 5 , 5, 10, 10);
		context.fill()
	})
}

function resizeCanvas() {
	$canvas.width = window.innerWidth;
	$canvas.height = window.innerHeight;
	scorePosition = {x: $canvas.width/2, y:100};
	timerPosition = {x: 60, y: $canvas.height + 10};
}

function updatePlayers(players) {

	var playerNames = Object.keys(players);
	//var playerColor = colors[playerNames.length % 4];

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

function updatePowahs() {
	if (bigboomcooldown === 1) {
		bigboomcooldown = 0;
		console.log('BIGBOOM');
		setTimeout(resetPowahs, bigboomcooldowntime);
		setTimeout(function(){console.log('20%'); }, bigboomcooldowntime/5);
    setTimeout(function(){console.log('40%'); }, 2 * bigboomcooldowntime / 5);
    setTimeout(function(){console.log('60%'); }, 3 * bigboomcooldowntime / 5);
		setTimeout(function(){console.log('80%'); }, 4 * bigboomcooldowntime / 5);
	}
}

function resetPowahs() {
	bigboomcooldown = 0.5;
	console.log('Big Boom Ready');
}

function createNewPlayer(playerName) {
	var randomX = Math.floor((Math.random() * $canvas.width) + 1);
	var randomY = Math.floor((Math.random() * $canvas.height) + 1);
	var gamePiece = { loaded: false, x: randomX, y: randomY };
	gamePiece.avatar = new Image();
	gamePiece.avatar.onload = function() {
		gamePiece.loaded = true;
	}
	gamePiece.avatar.src = '/avatar/' + playerName;
	gamePieces[playerName] = gamePiece;
}

function drawPlayers() {

	var playerNames = Object.keys(gamePieces);

	playerNames.forEach(function(playerName) {
		var gamePiece = gamePieces[playerName];
		var fontPieceX = gamePiece.x;
		var fontPieceY = gamePiece.y;
		if(!gamePiece.loaded) return;
		context.beginPath();
		context.fillStyle = playerColor;
		context.arc(gamePiece.x, gamePiece.y, pieceWidth, 0, 2 * Math.PI, false)
		//context.fillRect(gamePiece.x, gamePiece.y, pieceWidth, pieceWidth)
		//context.drawImage(gamePiece.avatar ,gamePiece.x, gamePiece.y, pieceWidth, pieceWidth);
		context.fill()
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
	updatePlayerPosition();

	drawPlayers();

	drawObjects();

	drawScore();

	updatePowahs();

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
		if (keys[32]) {
			if (bigboomcooldown === 0.5)
			bigboomcooldown = 1;
		}

    velY *= friction;
    gamePiece.y += velY;
    velX *= friction;
    gamePiece.x += velX;

    if (gamePiece.x + pieceWidth >= $canvas.width) {
        gamePiece.x = $canvas.width - pieceWidth;
    } else if (gamePiece.x - pieceWidth <= 0) {
        gamePiece.x = 0 + pieceWidth;
    }

    if (gamePiece.y + pieceWidth > $canvas.height) {
        gamePiece.y = $canvas.height - pieceWidth;
    } else if (gamePiece.y - pieceWidth <= 0) {
        gamePiece.y = 0 + pieceWidth;
    }

	socket.emit('playerUpdate', {x: gamePiece.x, y: gamePiece.y});
}

document.body.addEventListener("keydown", function (e) {
    keys[e.keyCode] = true;
});
document.body.addEventListener("keyup", function (e) {
    keys[e.keyCode] = false;
});
window.addEventListener("resize", resizeCanvas);

window.requestAnimationFrame(animate);
createNewPlayer(user);
