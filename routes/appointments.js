const { Router } = require("express");
const router = Router({ mergeParams: true });

const appointmentDAO = require("../daos/appointment");
const userDAO = require("../daos/user")
const { isAuthenticated, isProvider } = require("../middleware/middleware");
const appointment = require("../models/appointment");

// POST /appointments - stores the appointment information
router.post("/", isAuthenticated, isProvider, async (req, res, next) => {
  const user = req.user;
  const { patientId, apptDate, providerId } = req.body;

  if (!req.body || JSON.stringify(req.body) === "{}") {
    res.status(404).send("Missing appointment information");
  } else if (isProvider && providerId !== user._id) {
    res
      .status(403)
      .send("You can only create appointments for yourself or your patients");
  } else {
    try {
      const isPatient = await userDAO.getUsersOfProvider(providerId, patientId);
			if (isPatient){
				const newAppointment = await appointmentDAO.createAppointment(
					patientId,
					apptDate,
					providerId
				);
					res.json(newAppointment);
			}

    } catch (e) {
      next(e);
    }
  }
});

// GET /appointments - returns all appointments for their userId. If Healthcare Provider, should get array of appointments from all patients/users
router.get("/", isAuthenticated, async (req, res, next) => {
  const { user } = req.user;
  const isProvider = user.roles.includes("provider");
  try {
		//if not patient
		if (isProvider && user._id !== user.providerId) {
			const isPatient = await userDAO.getUsersOfProvider(providerId, patientId);
			if (!isPatient){
				res
				.status(403)
				.send("You can only get appointments for yourself or your patients");
			}
		} 
		const newAppointment = await appointmentDAO.getAppointments(
			user._id,
			isProvider
		);
		res.json(newAppointment);

  } catch (e) {
    next(e);
  }
});

// GET /appointments/:id - returns the appointment with the provided id and that has their userId. If Healthcare Provider, should get specified appointment.

router.get("/:id", isAuthenticated, async (req, res, next) => {
  const { user } = req.user;
  const appointmentId = req.params.id;
  const isProvider = user.roles.includes("provider");
  try {
		//With 2 filters, Should not get an appointment for a patient that isn't theirs.
    const newAppointment = await appointmentDAO.getAppointmentById(
      appointmentId,
      user._id,
      isProvider
    );
    res.json(newAppointment);
  } catch (e) {
    next(e);
  }
});

// PUT /appointments/:id(requires authorization) -  Healthcare Providers can update the appointment with the provided id and that has their userId

router.put("/:id", isAuthenticated, isProvider, async (req, res, next) => {
  const { user } = req.user;
  const appointmentId = req.params.id;
  const appointmentObj = req.body; //should just be the date
  try {
		//if their appointment
			const isAppointment = await appointmentDAO.getAppointmentById(appointmentId, user._id, true);
			if (!isAppointment){
				res
				.status(403)
				.send("You can only update appointments for yourself or your patients");
			}
    const updatedAppointment = await appointmentDAO.updateAppointment(
      appointmentId,
      user._id,
      appointmentObj
    );
    res.json(updatedAppointment);
  } catch (e) {
    next(e);
  }
});

// DELETE /appointments/:id (requires authorization)  - Healthcare Providers can delete appointment with provided id from specified use
router.delete("/:id", isAuthenticated, isProvider, async (req, res, next) => {
  const { user } = req.user;
  const appointmentId = req.params.id;
  try {
    const deletedAppointment = await appointmentDAO.cancelAppointment(
      appointmentId,
      user._id
    );
    res.json(deletedAppointment);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
