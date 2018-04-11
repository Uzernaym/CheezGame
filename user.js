var mongoose = require('mongoose');

var model = mongoose.model('user', new mongoose.Schema({
	UserName: {type: String, unique: true}
	, Name: {type: String, unique: true}
	, Age: {type: String, unique: true}
	, Email: {type: String, unique: true}
	, password: {type: String}
}));

exports.getModel = function() {
	return model;
}
