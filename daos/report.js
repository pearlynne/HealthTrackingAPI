const mongoose = require("mongoose");
const Report = require("../models/report");
const User = require("../models/user");

module.exports = {};


module.exports.createReport = async (userId, reportObj) => {
  const userInfo = await User.findById({ _id: userId });
  return await Report.create({
    name: userInfo.name,
    email: userInfo.email,
		providerId: userInfo.providerId,
    userId: userId,
    ...reportObj,
  });
};


module.exports.getReportById = async (userId, reportId, isProvider) => {
  return isProvider
    ? await Report.find(
        { _id: reportId, providerId: userId },
        { userId: 0, providerId: 0, __v: 0 }
      ).lean()
    : await Report.find(
        { _id: reportId, userId: userId },
        { userId: 0, providerId: 0, __v: 0 }
      ).lean();
};


module.exports.getReports = async (userId, isProvider) => {
  return isProvider
    ? await Report.find(
        { providerId: userId },
        { userId: 0, providerId: 0, __v: 0 }
      ).lean()
    : await Report.find(
        { userId: userId },
        { userId: 0, providerId: 0, __v: 0 }
      ).lean();
};


module.exports.getReportsBySearchTerm = async (
  userId,
  searchTerms,
  isProvider
) => {
  return isProvider
    ? await Report.find(
        { providerId: userId, $text: { $search: searchTerms } },
        { score: { $meta: "textScore" } },
        { projection: { userId: 0, providerId: 0, __v: 0 } },
      ).sort({name :1})
    : await Report.find(
        { userId: userId, $text: { $search: searchTerms } },
        { score: { $meta: "textScore" } },
        { projection: { userId: 0, providerId: 0, __v: 0 } }
      ).sort({name :1});
};


module.exports.getReportStats = async (userId, isProvider) => {
  return isProvider
    ? await Report.aggregate([
        { $match: { providerId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: "$userId",
            email: { $first: "$email" },
            name: { $first: "$name" },
            averageMood: { $avg: "$mood" },
            Inattentiveness: { $avg: "$inattentiveness" },
            Hyperactivity: { $avg: "$hyperactivity" },
            Impulsitivity: { $avg: "$impulsitivity" },
          },
        },
        { $sort: { name: 1 } },
      ])
    : await Report.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: "$userId",
            email: { $first: "$email" },
            name: { $first: "$name" },
            averageMood: { $avg: "$mood" },
            Inattentiveness: { $avg: "$inattentiveness" },
            Hyperactivity: { $avg: "$hyperactivity" },
            Impulsitivity: { $avg: "$impulsitivity" },
          },
        },
      ]);
};


module.exports.getReportStatsByUserId = async (providerId, userId) => {
  return await Report.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        providerId: new mongoose.Types.ObjectId(providerId),
      },
    },
    {
      $group: {
        _id: "$userId",
        averageMood: { $avg: "$mood" },
        Inattentiveness: { $avg: "$inattentiveness" },
        Hyperactivity: { $avg: "$hyperactivity" },
        Impulsitivity: { $avg: "$impulsitivity" },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        pipeline: [{ $project: { name: 1, email: 1 } }],
        as: "Patient",
      },
    },
    { $unwind: "$Patient" },
    { $unset: ["_id", "Patient._id"] },
  ]);
};


module.exports.updateReportById = async (userId, reportId, updatedObj) => {
  return await Report.findOneAndUpdate(
    { _id: reportId, userId: userId },
    { ...updatedObj },
    {
      projection: { userId: 0, providerId: 0, __v: 0 },
      new: true,
    }
  );
};


module.exports.deleteReportById = async (userId, reportId) => {
  return await Report.findOneAndDelete({ _id: reportId, userId: userId });
};
