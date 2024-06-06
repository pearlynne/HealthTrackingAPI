const { Router } = require("express");
const router = Router({ mergeParams: true });

const appointmentDAO = require("../daos/appointment");
const userDAO = require("../daos/user");
const { isAuthenticated, isProvider } = require("../middleware/middleware");


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
  } else if (providerId !== user._id) {
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
        res.json(newAppointment);
      }
    } catch (e) {
      next(e);
    }
  }
});


router.get("/", isAuthenticated, async (req, res, next) => {
  const user = req.user;
  const isProvider = user.roles.includes("provider");

  try {
    const newAppointment = await appointmentDAO.getAppointments(
      user._id,
      isProvider
    );
    if (newAppointment.length === 0) {
      res.status(404).send("You do not have any appointments");
    } else {
			res.json(newAppointment);
    }
  } catch (e) {
		next(e);
  }
});


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


router.put("/:id", isAuthenticated, isProvider, async (req, res, next) => {
  const user = req.user;
  const appointmentId = req.params.id;
  const { date } = req.body; 

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
});



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
