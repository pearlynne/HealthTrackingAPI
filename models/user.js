const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  roles: { type: [{ type: String }], required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId },
});


// User.pre('save', function (next) {
	// 	// Modify the document or perform additional tasks
	// 	this.providerId = this._id;
	// 	next();
	//  });


module.exports = mongoose.model("users", userSchema);
