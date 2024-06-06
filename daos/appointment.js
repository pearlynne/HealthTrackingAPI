const Appointment = require("../models/appointment");
const User = require("../models/user");
const mongoose = require("mongoose");

module.exports = {};


module.exports.createAppointment = async (patientId, apptDate, providerId) => {
  const userInfo = await User.findById({ _id: patientId });
  return await Appointment.create({
    name: userInfo.name,
    email: userInfo.email,
    userId: patientId,
    date: apptDate,
    providerId: providerId,
  });
};


module.exports.getAppointments = async (userId, isProvider) => {
  return isProvider
    ? await Appointment.aggregate([
        { $match: { providerId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: "$name", date: { $push: "$date" } } },
        { $project: { _id: 0, name: "$_id", date: 1 } },
        { $sort: { name: 1 } },
      ])
    : await Appointment.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
          $lookup: {
            from: "users",
            localField: "providerId",
            foreignField: "_id",
            as: "Doctor",
          },
        },
        { $unwind: "$Doctor" },
        { $group: { _id: "$Doctor.name", date: { $push: "$date" } } },
        { $project: { _id: 0, name: "$_id", date: 1 } },
      ]);
};


module.exports.getAppointmentById = async (
  appointmentId,
  userId,
  isProvider
) => {
  return isProvider
    ? await 
      Appointment.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(appointmentId),
            providerId: new mongoose.Types.ObjectId(userId),
          },
        },
        { $group: { _id: "$name", date: { $push: "$date" } } },
        { $project: { _id: 0, name: "$_id", date: 1 } },
      ])
    : await Appointment.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(appointmentId),
            userId: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "providerId",
            foreignField: "_id",
            as: "Doctor",
          },
        },
        { $unwind: "$Doctor" },
        { $group: { _id: "$Doctor.name", date: { $push: "$date" } } },
        { $project: { _id: 0, name: "$_id", date: 1 } },
      ]);
};


module.exports.updateAppointment = async (apptId, providerId, date) => {
  return await Appointment.findOneAndUpdate(
    {
      _id: apptId,
      providerId: providerId,
    },
    { date: date },
    { new: true }
  );
};

module.exports.cancelAppointment = async (apptId, providerId) => {
  return await Appointment.findOneAndDelete({
    _id: apptId,
    providerId: providerId,
  });
};
