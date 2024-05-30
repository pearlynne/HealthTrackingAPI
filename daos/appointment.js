const Appointment = require("../models/appointment");
const User = require("../models/user");

const mongoose = require("mongoose");

module.exports = {};

// Create new appointments
module.exports.createAppointment = async (patientId, apptDate, providerId) => {
  return await Appointment.create({
    userId: patientId,
    date: apptDate,
    providerId: providerId,
  });
};

// Get appointments and details such as date, time, location.
module.exports.getAppointments = async (userId, isProvider) => {
  return isProvider
    ? await Appointment.aggregate([
        { $match: { providerId: new mongoose.Types.ObjectId(userId) } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "Patient",
          },
        },
        { $unwind: "$Patient" },
        { $group: { _id: "$Patient.name", date: { $push: "$date" } } },
        { $project: { _id: 0, name: "$_id", date: 1 } },
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
    ? await // Appointment.findOne({ _id: appointmentId, providerId: userId })
      Appointment.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(appointmentId),
            providerId: new mongoose.Types.ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "Patient",
          },
        },
        { $unwind: "$Patient" },
        { $group: { _id: "$Patient.name", date: { $push: "$date" } } },
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

module.exports.updateAppointment = async (apptId, providerId, apptObj) => {
  // How to update individual appointment variables (for now it's only the date)
  return Appointment.findOneAndUpdate(
    {
      _id: apptId,
      providerId: providerId,
    },
    apptObj
  );
};

module.exports.cancelAppointment = async (apptId, providerId) => {
  return await Appointment.deleteOne({
    _id: apptId,
    providerId: providerId,
  });
};
