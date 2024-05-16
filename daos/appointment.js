const Appointment = require("../models/appointment");

module.exports = {};

// Create new appointments
module.exports.createAppointment = async (userId, apptDate, providerId) => {
  return await Appointment.create({
    userId: userId,
    date: new Date(apptDate).toDateString, //To Confirm
    providerId: providerId,
  });
};

// Get appointments and details such as date, time, location.
module.exports.getAppointments = async (userId, isProvider) => {
  return isProvider
    ? await Appointment.find({ providerId: userId })
    : await Appointment.find({ userId: userId });
};

module.exports.getAppointmentById = async (
  appointmentId,
  userId,
  isProvider
) => {
  return isProvider
    ? await Appointment.findOne({ _id: appointmentId, providerId: userId })
    : await Appointment.findOne({ _id: appointmentId, userId: userId });
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
