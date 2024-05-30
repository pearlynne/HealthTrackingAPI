const { Router } = require("express");
const router = Router({ mergeParams: true });

const appointmentDAO = require("../daos/appointment");
const userDAO = require("../daos/user");
const { isAuthenticated, isProvider } = require("../middleware/middleware");

// POST /appointments - stores the appointment information
router.post("/", isAuthenticated, isProvider, async (req, res, next) => {
  const user = req.user;
  const patientId = req.body.userId;
  const apptDate = req.body.date;
  const providerId = req.body.providerId;

  if (
    !patientId ||
    !apptDate ||
    !providerId ||
    !req.body ||
    JSON.stringify(req.body) === "{}"
  ) {
    res.status(404).send("Missing appointment information");
    //Is this the right error code?
  } else if (isProvider && providerId !== user._id) {
    res.status(404).send("You cannot create appointments for other providers");
  } else {
    try {
      const isPatient = await userDAO.getUsersOfProvider(providerId, patientId);
      if (isPatient.length === 0) {
        res
          .status(404)
          .send("You can only create appointments for your patients");
      } else {
        const newAppointment = await appointmentDAO.createAppointment(
          patientId,
          apptDate,
          providerId
        );
        res.send({
          _id: newAppointment._id,
          userId: newAppointment.userId,
          date: newAppointment.date,
          providerId: newAppointment.providerId,
        });
      }
    } catch (e) {
      next(e);
    }
  }
});

// GET /appointments - returns all appointments for their userId. If Healthcare Provider, should get array of appointments from all patients/users
router.get("/", isAuthenticated, async (req, res, next) => {
  const user = req.user;
  const isProvider = user.roles.includes("provider");

  try {
    const newAppointment = await appointmentDAO.getAppointments(
      user._id,
      isProvider
    );
    if (newAppointment.length === 0) {
      res.status(200).send("You do not have any appointments");
    } else {
      res.json(newAppointment);
    }
  } catch (e) {
    next(e);
  }
});

// GET /appointments/:id - returns the appointment with the provided id and that has their userId. If Healthcare Provider, should get specified appointment.

router.get("/:id", isAuthenticated, async (req, res, next) => {
  const user = req.user;
  const appointmentId = req.params.id;
  const isProvider = user.roles.includes("provider");

  try {
    const newAppointment = await appointmentDAO.getAppointmentById(
      appointmentId,
      user._id,
      isProvider
    );

    if (newAppointment.length === 0) {
      res.status(404).send("You do not have this appointment");
    } else {
      res.json(newAppointment);
    }
  } catch (e) {
    next(e);
  }
});

// PUT /appointments/:id (requires authorization) -  Healthcare Providers can update the appointment with the provided id and that has their userId
router.put("/:id", isAuthenticated, isProvider, async (req, res, next) => {
  const user = req.user;
  const appointmentId = req.params.id;
  const { date } = req.body; //should just be the date

  if (!date) {
    res.status(404).send("Appointment date needed");
  } else {
    try {
      const updatedAppointment = await appointmentDAO.updateAppointment(
        appointmentId,
        user._id,
        date
      );
      if (updatedAppointment === null) {
        res.status(404).send("You do not have this appointment");
      } else {
        const returnAppointment = await appointmentDAO.getAppointmentById(
          appointmentId,
          user._id,
          true
        );
        res.json(returnAppointment);
      }
    } catch (e) {
      next(e);
    }
  }
  //if their appointment; covered in dao
  // const isAppointment = await appointmentDAO.getAppointmentById(appointmentId, user._id, true);
  // if (!isAppointment){
  // 	res
  // 	.status(403)
  // 	.send("You can only update appointments for yourself or your patients");
  // }
});

// DELETE /appointments/:id (requires authorization)  - Healthcare Providers can delete appointment with provided id from specified use
router.delete("/:id", isAuthenticated, isProvider, async (req, res, next) => {
  const user = req.user;
  const appointmentId = req.params.id;

  try {
    const deletedAppointment = await appointmentDAO.cancelAppointment(
      appointmentId,
      user._id
    );
    if (deletedAppointment === null) {
      res.status(404).send("You do not have this appointment");
    } else {
      res.status(200).send("Appointment deleted");
    }
  } catch (e) {
    next(e);
  }
});

module.exports = router;
