const User = require("../models/user");

module.exports = {};

// Store a user record
module.exports.signup = async (name, email, hash, roles, providerId) => {
  try {
    return providerId
      ? await User.create({
          name: name,
          email: email,
          password: hash,
          roles: roles,
          providerId: providerId,
        })
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
module.exports.getUsersOfProvider = async (providerId) => {
  return await User.find({ providerId: providerId }).lean();
};

// Update the user's password field
module.exports.updateUserPassword = async (userId, password) => {
  return await User.updateOne({ _id: userId }, { password: password });
};

// Update user’s Healthcare Provider
module.exports.updateUserProvider = async (userId, providerId) => {
  return await User.updateOne({ _id: userId }, { providerId: providerId });
  //check if need to change to mongoose object
};

class BadDataError extends Error {}
module.exports.BadDataError = BadDataError;
