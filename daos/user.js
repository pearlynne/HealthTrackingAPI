const User = require("../models/user");
const mongoose = require("mongoose");

module.exports = {};


module.exports.signup = async (name, email, hash, roles) => {
  try {
    return roles.includes("provider")
      ? await User.create({
          name: name,
          email: email,
          password: hash,
          roles: roles,
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



module.exports.getUser = async (email) => {
  return await User.findOne({ email: email }).lean();
};



module.exports.getUsersOfProvider = async (userId, patientId) => {
  if (patientId) {
    return await User.aggregate([
      {
        $match: {
          providerId: new mongoose.Types.ObjectId(userId),
          _id: new mongoose.Types.ObjectId(patientId),
        },
      },
      { $project: { _id: 0, name: 1, email: 1 } },
    ]);
  } else {
    return await User.aggregate([
      { $match: { providerId: new mongoose.Types.ObjectId(userId) } },
      { $project: { _id: 0, name: 1, email: 1 } },

      { $sort: { name: 1 } },
    ]);
  }
};



module.exports.updateUserPassword = async (userId, password) => {
  return await User.updateOne(
    { _id: new mongoose.Types.ObjectId(userId) },
    { password: password }
  );
};



module.exports.updateUserProvider = async (userId, providerId) => {
  return await User.findOneAndUpdate(
    { _id: userId },
    { providerId: providerId },
    { new: true, projection: { name: 1, email: 1, providerId: 1 } }
  );
};


class BadDataError extends Error {}
module.exports.BadDataError = BadDataError;
