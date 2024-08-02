const User = require("../models/user");
const mongoose = require("mongoose");

module.exports = {};

// Store a user record
module.exports.signup = async (firstName, lastName, email, hash, roles) => {
  try {
    return roles === "provider"
      ? await User.create({
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: hash,
          roles: ["user", "provider"],
        })
      : await User.create({
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: hash,
          roles: ["user"],
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
  if (patientId) {
    return await User.aggregate([
      {
        $match: {
          providerId: new mongoose.Types.ObjectId(userId),
          _id: new mongoose.Types.ObjectId(patientId),
        },
      },
      { $project: { _id: 0, firstName: 1, lastName: 1, email: 1 } },
    ]);
  } else {
    return await User.aggregate([
      { $match: { providerId: new mongoose.Types.ObjectId(userId) } },
      { $project: { _id: 0, firstName: 1, lastName: 1, email: 1 } },

      { $sort: { firstName: 1, lastName: 1 } },
    ]);
  }
};

// Update the user's password field
module.exports.updateUserPassword = async (userId, password) => {
  return await User.updateOne(
    { _id: new mongoose.Types.ObjectId(userId) },
    { password: password }
  );
};

// Update user’s Healthcare Provider
module.exports.updateUserProvider = async (userId, providerId) => {
  return await User.findOneAndUpdate(
    { _id: userId },
    { providerId: providerId },
    { new: true, projection: { firstName: 1, lastName:1,  email: 1, providerId: 1 } }
  );
};

class BadDataError extends Error {}
module.exports.BadDataError = BadDataError;
