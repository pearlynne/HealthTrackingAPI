const User = require("../models/user");

module.exports = {};

// Store a user record
module.exports.createUser = async (objLog) => {
  try {
    return await User.create(objLog);
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

// Update the user's password field
module.exports.updateUserPassword = async (userId, password) => {
  return await User.updateOne({ _id: userId }, { password: password });
};

// Update user’s Healthcare Provider
module.exports.updateUserProvider = async (userId, provider) => {
  return await User.updateOne({ _id: userId }, { provider: provider }); 
	//check if need to change to mongoose object
};

class BadDataError extends Error {}
module.exports.BadDataError = BadDataError;
