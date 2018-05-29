var gamePieces = {};
var playerFont = "15px Arial";
var $canvas = document.querySelector('canvas');
var context = $canvas.getContext('2d');
$canvas.width = window.innerWidth;
$canvas.height = window.innerHeight;
//var randomX = Math.floor((Math.random() * $canvas.width) + 1);
//var randomY = Math.floor((Math.random() * $canvas.height) + 1);
var keys = [];
var velY = 0;
var velX = 0;
var speed = 5;
var friction = 0.98;
var pieceWidth = 15;


var bigBalls = true;
var leftHeld = false;
var upHeld = false;
var rightHeld = false;
var downHeld = false;
var gravityOn = false;
var objArray = [];
var paused = false;
var totalKineticEnergy = 0;
var bumped = false;


//World and Viewport Variables

//Object Variables
var objectSprite = document.getElementById("objectSprite");
var objectsSize = [3, 5, 10];
var objectSpeed = [0.1, 0.5, 1, 1.5, 2.5, 3]
var objects = [];

//Scoring Variables
var score = 1;
var scoreFont = "50px Arial";
var scorePosition = {x: $canvas.width/2, y:100};
var timer = 0;
var timerFont = "20px Arial";
var timerPosition = {x: 60, y: $canvas.height - 10};
var textColor = "White";

//Powahs
var bigboomcooldown = 0.5;
var bigboomcooldowntime = 5000;

//Random Color
var colors = ['red', 'green', 'blue', 'orange'];
var playerColor = colors[Math.floor(Math.random() * colors.length)];



socket.on('playerUpdate', updatePlayers);

function drawObjects() {
	//objects.forEach(function(object) {
		var randomSize = Math.floor(Math.random() * objectsSize);
		context.beginPath();
		context.arc(objects.x, objects.y, objectsSize, 0, 2 * Math.PI, false);
		context.fill();
		context.drawImage(objectSprite ,  randomY, randomX, 100, 100);
		context.fill();

}

function animateObjects() {
}








function Ball(x, y, radius) {
    this.radius = radius;
    this.dx = randomDx();
    this.dy = randomDy();
    // mass is that of a sphere as opposed to circle.
    // it *does* make a difference.
    this.mass = this.radius * this.radius * this.radius;
    this.x = x;
    this.y = y;
    this.color = playerColor;
    this.draw = function() {
        context.beginPath();
        context.arc(Math.round(this.x), Math.round(this.y), this.radius, 0, 2*Math.PI);
        context.fillStyle = this.color;
        context.fill();
        context.strokeStyle = 'rgba(0, 0, 0, 0.6)';
        context.stroke();
        context.closePath();
    };
    this.speed = function() {
        // magnitude of velocity vector
        return Math.sqrt(this.dx * this.dx + this.dy * this.dy);

				if (this.speed >= 5) {
					this.speed = 5;
				}
    };
    this.angle = function() {
        //angle of ball with the x axis
        return Math.atan2(this.dy, this.dx);
    };
    this.kineticEnergy = function () {
    // only for masturbation purposes, not rly used for computation.
        return (0.5 * this.mass * this.speed() * this.speed());
    };
    this.onGround = function() {
        return (this.y + this.radius >= $canvas.height)
    }
}

function wallCollision(ball) {
    if (ball.x - ball.radius + ball.dx < 0 ||
        ball.x + ball.radius + ball.dx > $canvas.width) {
        ball.dx *= -1;
    }
    if (ball.y - ball.radius + ball.dy < 0 ||
        ball.y + ball.radius + ball.dy > $canvas.height) {
        ball.dy *= -1;
    }
    if (ball.y + ball.radius > $canvas.height) {
        ball.y = $canvas.height - ball.radius;
    }
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
    }
    if (ball.x + ball.radius > $canvas.width) {
        ball.x = $canvas.width - ball.radius;
    }
    if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
    }
}

function ballCollision() {
    for (var obj1 in objArray) {
        for (var obj2 in objArray) {
            if (obj1 !== obj2 && distanceNextFrame(objArray[obj1], objArray[obj2]) <= 0) {
                var theta1 = objArray[obj1].angle();
                var theta2 = objArray[obj2].angle();
                var phi = Math.atan2(objArray[obj2].y - objArray[obj1].y, objArray[obj2].x - objArray[obj1].x);
                var m1 = objArray[obj1].mass;
                var m2 = objArray[obj2].mass;
                var v1 = objArray[obj1].speed();
                var v2 = objArray[obj2].speed();

                var dx1F = (v1 * Math.cos(theta1 - phi) * (m1-m2) + 2*m2*v2*Math.cos(theta2 - phi)) / (m1+m2) * Math.cos(phi) + v1*Math.sin(theta1-phi) * Math.cos(phi+Math.PI/2);
                var dy1F = (v1 * Math.cos(theta1 - phi) * (m1-m2) + 2*m2*v2*Math.cos(theta2 - phi)) / (m1+m2) * Math.sin(phi) + v1*Math.sin(theta1-phi) * Math.sin(phi+Math.PI/2);
                var dx2F = (v2 * Math.cos(theta2 - phi) * (m2-m1) + 2*m1*v1*Math.cos(theta1 - phi)) / (m1+m2) * Math.cos(phi) + v2*Math.sin(theta2-phi) * Math.cos(phi+Math.PI/2);
                var dy2F = (v2 * Math.cos(theta2 - phi) * (m2-m1) + 2*m1*v1*Math.cos(theta1 - phi)) / (m1+m2) * Math.sin(phi) + v2*Math.sin(theta2-phi) * Math.sin(phi+Math.PI/2);

                objArray[obj1].dx = dx1F;
                objArray[obj1].dy = dy1F;
                objArray[obj2].dx = dx2F;
                objArray[obj2].dy = dy2F;
            }
        }
        wallCollision(objArray[obj1]);
    }
}

function staticCollision() {
    for (var obj1 in objArray) {
        for (var obj2 in objArray) {
            if (obj1 !== obj2 &&
                distance(objArray[obj1], objArray[obj2]) < objArray[obj1].radius + objArray[obj2].radius)
            {
                var theta = Math.atan2((objArray[obj1].y - objArray[obj2].y), (objArray[obj1].x - objArray[obj2].x));
                var overlap = objArray[obj1].radius + objArray[obj2].radius - distance (objArray[obj1], objArray[obj2]);
                var smallerObject = objArray[obj1].radius < objArray[obj2].radius ? obj1 : obj2
                objArray[smallerObject].x -= overlap * Math.cos(theta);
                objArray[smallerObject].y -= overlap * Math.sin(theta);
            }
        }
    }
}

function applyGravity() {
    for (var obj in objArray) {
        if (objArray[obj].onGround() == false) {
            objArray[obj].dy += 0.29;
        }
    }
}

function applyDrag() {
    for (var obj in objArray) {
        objArray[obj].dx *= 0.99
        objArray[obj].dy *= 0.99
    }
}

function moveObjects() {
    for (var obj in objArray) {
        objArray[obj].x += objArray[obj].dx;
        objArray[obj].y += objArray[obj].dy;
    }
}

function drawObjects() {
    for (var obj in objArray) {
        objArray[obj].draw();
    }
}

for (i = 0; i<15; i++) {
    var temp = new Ball(randomX(), randomY(), randomRadius());
    temp.dx = 0;
    temp.dy = 0;
    objArray[objArray.length] = temp;
}

function randomX() {
    x = Math.floor(Math.random() * $canvas.width);
    if (x < 30) {
        x = 30;
    } else if (x + 30 > $canvas.width) {
        x = $canvas.width - 30;
    }
    return x;
}

function randomY() {
    y = Math.floor(Math.random() * $canvas.height);
    if (y < 30) {
        y = 30;
    } else if (y + 30 > $canvas.height) {
        y = $canvas.height - 30;
    }
    return y;
}

function randomRadius() {
    if (bigBalls) {
        r = Math.ceil(Math.random() * 10 + 20);
        return r;
    } else {
        r = Math.ceil(Math.random() * 2 + 1);
        //r = 2;
        return r;
    }
}

function randomDx() {
    r = Math.floor(Math.random() * 10 - 5);
    return r;
}

function randomDy() {
    r = Math.floor(Math.random() * 10 - 5);
    return r;
}

function distanceNextFrame(a, b) {
    return Math.sqrt((a.x + a.dx - b.x - b.dx)**2 + (a.y + a.dy - b.y - b.dy)**2) - a.radius - b.radius;
}

function distance(a, b) {
    return Math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2);
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

	animateObjects();

	drawScore();

	updatePowahs();

	//checkCollisions();





	if (!paused) {
			if (gravityOn) {
					applyGravity();
					applyDrag();
			}
			moveObjects();
	}

		drawObjects();
		staticCollision();
		ballCollision();



	window.requestAnimationFrame(animate);
}

function updatePlayerPosition() {

	var gamePiece = gamePieces[user];

		/*	if (keys[38]) {
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

		*/

		if (keys[67]) { // c
        objArray[objArray.length] = new Ball(randomX(), randomY(), randomRadius());
		}

		if (keys[37]) { // left arrow
        for (var obj in objArray) {
            objArray[obj].dx -= 0.3;
        }
    } if (keys[38]) { // up arrow
        for (var obj in objArray) {
            objArray[obj].dy -= 0.3;
        }
    } if (keys[39]) { // right arrow
        for (var obj in objArray) {
            objArray[obj].dx += 0.3;
        }
    } if (keys[40]) { // down arrow
        for (var obj in objArray) {
            objArray[obj].dy += 0.3;
        }
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
