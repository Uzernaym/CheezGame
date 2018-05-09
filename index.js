/* The express module is used to look at the address of the request and send it to the correct function */
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var usermodel = require('./user.js').getModel();
var Io = require('socket.io');
var crypto = require('crypto');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var fs = require('fs');

/* The http module is used to listen for requests from a web browser Confuse */
var http = require('http');

/* The path module is used to transform relative paths to absolute paths */
var path = require('path');

/* Creates an express application */
var app = express();

/* Creates the web server */
var server = http.createServer(app);

/* creates the socket server */
var io = Io(server);

/* Defines what port to use to listen to web requests */
var port =  process.env.PORT ? parseInt(process.env.PORT) : 8080;

var dbAddress = process.env.MONGODB_URI || 'mongodb://127.0.0.1/cheezit';


function addSockets() {

	var players = {};

	io.on('connection', (socket) => {
		var user = socket.handshake.query.user;

		if(players[user]) return;
		players[user] = {
			x: 0, y: 0
		}
		io.emit('newMessage', {user: user, message: 'has entered the game'});

		/* UPDATE ALL BROWSERS THAT A NEW PLAYER HAS JOINED */
		io.emit('playerUpdate', players);

		socket.on('disconnect', () => {
			delete players[user];
			io.emit('newMessage', {user: user, message: 'has left the game'});

			/* UPDATE ALL BROWSERS THAT A PLAYER HAS LEFT THE GAME */
			io.emit('playerUpdate', players);
		});

		socket.on('message', (message) => {
			io.emit('newMessage', {user: user, message});
		});

		/* RECIEVED A PLAYER UPDATE FROM A BROWSER */
		socket.on('playerUpdate', (player) => {
			players[user] = player;
			/* UPDATE ALL BROWSERS THAT A PLAYER HAS MOVED */
			io.emit('playerUpdate', players);
		});
	});

}




function startServer() {
  addSockets();

	function authenticateUser(username, password, callback) {

		if(!username) return callback('No username given');
		if(!password) return callback('No password given');
		usermodel.findOne({userName: username}, function(err, user) {
			if(err) return callback('Error connecting to database');
			if(!user) return callback('Incorrect username');
			crypto.pbkdf2(password, user.salt, 10000, 256, 'sha256', function(err, resp) {
				if(err) return callback('Error handling password');
				if(resp.toString('base64') !== user.password) return callback('Incorrect password');
				callback(null, user);
			});
		});

	}

	app.use(bodyParser.json({ limit: '16mb' }));
	app.use(express.static(path.join(__dirname, 'public')));

  app.use(session({ secret: 'sillybob'}));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy({usernameField: 'userName', passwordField: 'password'}, authenticateUser));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  })

  passport.deserializeUser(function(id, done) {
    usermodel.findById(id, function(err, user) {
      done(err, user);
    });
  });

  app.get('/login', (req, res, next) => {
    var filePath = path.join(__dirname, './login.html');
    res.sendFile(filePath);
  });

  app.get('/logout', (req, res, next) => {
    req.logOut();
    res.redirect('/login');
  })

	app.post('/login', (req, res, next) => {
    passport.authenticate('local', function(err, user) {
      if(err) return res.send({error: err});
      req.logIn(user, (err) => {
        if (err) return res.send({error: err});
        return res.send({error: null});
      });
    })(req, res, next);
  });

	/* Defines what function to call when a request comes from the path '/' in http://localhost:8080 */
	app.get('/form', (req, res, next) => {

		/* Get the absolute path of the html file */
		var filePath = path.join(__dirname, './index.html')

		/* Sends the html file back to the browser */
		res.sendFile(filePath);
	});

	app.post('/form', (req, res, next) => {

  	// Converting the request in an user object
  	var newuser = new usermodel(req.body);

  	// Grabbing the password from the request
  	var password = req.body.password;

  	// Adding a random string to salt the password with
  	var salt = crypto.randomBytes(128).toString('base64');
  	newuser.salt = salt;

  	// Winding up the crypto hashing lock 10000 times
  	var iterations = 10000;
  	crypto.pbkdf2(password, salt, iterations, 256, 'sha256', function(err, hash) {
  		if(err) {
  			return res.send({error: err});
  		}
  		newuser.password = hash.toString('base64');
  		// Saving the user object to the database
  		newuser.save(function(err) {

  			// Handling the duplicate key errors from database
  			if(err && err.message.includes('duplicate key error') && err.message.includes('userName')) {
  				return res.send({error: 'Username, ' + req.body.userName + ' already taken'});
  			}
  			if(err) {
  				return res.send({error: err.message});
  			}
  			res.send({error: null});

  		});
  	});
  });

app.get('/', (req, res, next) => {

	/* Get the absolute path of the html file */
	var filePath = path.join(__dirname, './home.html')

	/* Sends the html file back to the browser */
	res.sendFile(filePath);
});

app.get('/home.css', (req, res, next) => {

	/* Get the absolute path of the html file */
	var filePath = path.join(__dirname, './home.css')

	/* Sends the html file back to the browser */
	res.sendFile(filePath);
});

app.get('/home.js', (req, res, next) => {

	/* Get the absolute path of the html file */
	var filePath = path.join(__dirname, './home.js')

	/* Sends the html file back to the browser */
	res.sendFile(filePath);
});

app.get('/index.css', (req, res, next) => {

	/* Get the absolute path of the html file */
	var filePath = path.join(__dirname, './index.css')

	/* Sends the html file back to the browser */
	res.sendFile(filePath);
});

app.get('/game.js', (req, res, next) => {
	/* Get the absolute path of the html file */
	var filePath = path.join(__dirname, './game.js')
  /* Sends the html file back to the browser */
	res.sendFile(filePath);
});

app.get('/game.css', (req, res, next) => {
	/* Get the absolute path of the html file */
	var filePath = path.join(__dirname, './game.css')
	/* Sends the html file back to the browser */
	res.sendFile(filePath);
});

app.get('/game', (req, res, next) => {
		if(!req.user) return res.redirect('/login');
		var filePath = path.join(__dirname, './game.html');
		var fileContents = fs.readFileSync(filePath, 'utf8');
		fileContents = fileContents.replace('{{USERNAME}}', req.user.userName);
		res.send(fileContents);
	});

app.get('/picture/:username', (req, res, next) => {
	if(!req.user) return res.send('ERROR');
	usermodel.findOne({userName: req.params.username}, function(err, user) {
		if(err) return res.send(err);
		try {
			var imageType = user.picture.match(/^data\:image\/([a-zA-Z0-9]*);/)[1];
			var base64Data = user.picture.split(',')[1];
			var binaryData = new Buffer(base64Data, 'base64');
			res.contentType('image/' + imageType);
			res.end(binaryData, 'binary');
		} catch(ex) {
			res.send(ex);
		}
	})
})

/* Defines what function to all when the server recieves any request from http://localhost:8080 */
server.on('listening', () => {

	/* Determining what the server is listening for */
	var addr = server.address()
		, bind = typeof addr === 'string'
			? 'pipe ' + addr
			: 'port ' + addr.port
	;

	/* Outputs to the console that the webserver is ready to start listening to requests */
	console.log('Listening on ' + bind);
});

/* Tells the server to start listening to requests from defined port */
server.listen(port);
}

mongoose.connect(dbAddress, startServer)
