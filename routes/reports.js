const { Router } = require("express");
const router = Router({ mergeParams: true });

const reportDAO = require("../daos/report");
const { isAuthenticated } = require("../middleware/middleware");

router.post("/", isAuthenticated, async (req, res, next) => {
  const user = req.user;
  const reportInfo = req.body;
  if (!req.body || JSON.stringify(req.body) === "{}") {
    res.status(404).send("Missing report information");
  } else {
    try {
      const newReport = await reportDAO.createReport(user._id, reportInfo);
      if (newReport) {
        res.json(newReport);
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
    const reports = await reportDAO.getReports(user._id, isProvider);
    if (reports.length === 0) {
      res.status(404).send("There are no reports");
    } else {
      res.json(reports);
    }
  } catch (e) {
    next(e);
  }
});

router.get("/stats", isAuthenticated, async (req, res, next) => {
  const user = req.user;
  const isProvider = user.roles.includes("provider");

  if (req.query.patientId) {
    if (isProvider) {
      const stats = await reportDAO.getReportStatsByUserId(
        user._id,
        req.query.patientId
      );
      if (stats.length === 0) {
        res.status(404).send("No stats available");
      } else {
        res.json(stats);
      }
    } else {
      res.status(403).send("Forbidden");
    }
  } else {
    try {
      const stats = await reportDAO.getReportStats(user._id, isProvider);
      if (stats.length === 0) {
        res.status(404).send("No stats/reports");
      } else {
        res.json(stats);
      }
    } catch (e) {
      next(e);
    }
  }
});

router.get("/search", isAuthenticated, async (req, res, next) => {
  const user = req.user;
  const searchTerm = req.query.query;
  const isProvider = user.roles.includes("provider");

  if (!req.query.query) {
    res.status(404).send("Insert search terms");
  } else {
    try {
      const results = await reportDAO.getReportsBySearchTerm(
        user._id,
        searchTerm,
        isProvider
      );
      if (results.length === 0) {
        res.status(404).send("No reports with such terms");
      } else {
        res.json(results);
      }
    } catch (e) {
      next(e);
    }
  }
});

router.get("/:id", isAuthenticated, async (req, res, next) => {
  const user = req.user;
  const reportId = req.params.id;
  const isProvider = user.roles.includes("provider");
  try {
    const report = await reportDAO.getReportById(
      user._id,
      reportId,
      isProvider
    );
    if (report.length === 0) {
      res.status(404).send("There is no such report. You may not have access");
    } else {
      res.json(report);
    }
  } catch (e) {
    next(e);
  }
});

router.put("/:id", isAuthenticated, async (req, res, next) => {
  const user = req.user;
  const reportInfo = req.body;
  const reportId = req.params.id;

  if (!req.body || JSON.stringify(req.body) === "{}") {
    res.status(404).send("Missing report information");
  } else {
    try {
      const updatedReport = await reportDAO.updateReportById(
        user._id,
        reportId,
        reportInfo
      );
      if (updatedReport === null) {
        res
          .status(404)
          .send("There is no such report. You may not have access");
      } else {
        res.json(updatedReport);
      }
    } catch (e) {
      next(e);
    }
  }
});

router.delete("/:id", isAuthenticated, async (req, res, next) => {
  const user = req.user;
  const reportId = req.params.id;
     try {
      const deletedReport = await reportDAO.deleteReportById(
        user._id,
        reportId
      );
      if (deletedReport === null) {
				res.status(404).send("There is no such report. You may not have access")
			} else {
				res.status(200).send("Appointment deleted");

			}
    } catch (e) {
      next(e);
    }
 
});

module.exports = router;
