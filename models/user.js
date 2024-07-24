const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  contactNum: { type: Number },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  roles: { type: [{ type: String }], required: true },
  providerId: { type: mongoose.Schema.Types.ObjectId },
  medications: { type: [{ type: mongoose.Schema.Types.ObjectId }] },
});

module.exports = mongoose.model("users", userSchema);
