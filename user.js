var mongoose = require('mongoose');

var model = mongoose.model('user', new mongoose.Schema({
	Name: {type: String, unique: true}
	, email: {type: String, unique: true}
	CheezQuestion: {type: String, unique: true}
  likecheezit: {type: boolean}
	Password: {type: String}
}));

exports.getModel = function() {
	return model;
}
