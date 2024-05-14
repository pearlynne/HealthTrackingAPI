const Appointment = require("../models/appointment");

module.exports = {};

// Create new appointments
module.exports.createAppointment = async (userId, date, providerId) => {
  return await Appointment.create({
    userId: userId,
    date: new Date(date), //To Confirm
    providerId: providerId,
  });
};

// Get appointments and details such as date, time, location.
module.exports.getAppointment = async (userId, isProvider) => {
  return isProvider
    ? await Appointment.find({ userId: userId })
    : await Appointment.find({ providerId: userId });
};

module.exports.updateAppointment = async (apptId, providerId, apptObj) => {
  // Need to verify that providerId is valid
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
