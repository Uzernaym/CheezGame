var mongoose = require('mongoose');

var model = mongoose.model('user', new mongoose.Schema({
	UserName: {type: String, unique: true}
	, Name: {type: String, unique: true}
	, Age: {type: String}
	, Email: {type: String}
	, password: {type: String}
}));

exports.getModel = function() {
	return model;
}
