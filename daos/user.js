const User = require("../models/user");


module.exports = {};

// Store a user record
module.exports.signup = async (name, email, hash, roles) => {
  try {
    return roles.includes("provider")
      ? await User.create({
          name: name,
          email: email,
          password: hash,
          roles: roles 
        }) // Not sure if we can chain
      : await User.create({
          name: name,
          email: email,
          password: hash,
          roles: roles,
        }); 
  } catch (e) {
    if (e.message.includes("duplicate")) {
      throw new BadDataError("Email exists");
    } else {
      throw e;
    }
  }
};

// Get a user record using their email
module.exports.getUser = async (email) => {
  return await User.findOne({ email: email }).lean();
};

// Get all user records working with the same provider
module.exports.getUsersOfProvider = async (userId, patientId) => {
	.
	if (patientId) {
		return await User.find({ providerId: ObjectId(userId), userId: patientId }).lean();
	} else{
  return await User.find({ providerId: ObjectId(userId) }).lean();}
	// To fix: Should only return name, email, not password.
};

// Update the user's password field
module.exports.updateUserPassword = async (userId, password) => {
  return await User.updateOne({ _id: ObjectId(userId) }, { password: password });
};

// Update user’s Healthcare Provider
module.exports.updateUserProvider = async (userId, providerId) => {
  return await User.updateOne({ _id: ObjectId(userId) }, { providerId: ObjectId(providerId) });
  //check if need to change to mongoose object
};

class BadDataError extends Error {}
module.exports.BadDataError = BadDataError;
