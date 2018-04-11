var mongoose = require('mongoose');

var model = mongoose.model('user', new mongoose.Schema({
	UserName: {type: String, unique: true}
	, Email: {type: String}
	, password: {type: String}
}));

exports.getModel = function() {
	return model;
}

salt: {type: String}
