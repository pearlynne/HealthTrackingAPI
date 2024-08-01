const { Router } = require("express");
const router = Router();
const { routerAuth, addHeader } = require("./auth");

// Modified to pass token for API////
router.all("*", addHeader); //Comment out for tests;
router.use("/auth", routerAuth);
router.use("/profile", require("./profile"));

router.use("/users", require("./user"));
router.use("/reports", require("./reports"));
router.use("/appointments", require("./appointments"));

router.use((err, req, res, next) => {
  if (
    err.message.includes("Cast to ObjectId failed") ||
    err.message.includes("input must be a 24 character hex string")
  ) {
    // res.status(400).send("Invalid Object Id");
    res.status(400).render("error", { message: "Invalid Object Id" });
  } else {
    res.status(403).render("error", { message: "Something else broke!" });

    // res.status(500).send("Something else broke!");
  }
});

router.get("/", (req, res, next) => {
  res.render("index", {}, (err, html) => {
    if (err) return next(err);

    res.render("partials/layout", {
      title: "My HealthTech API",
      content: html,
    });
  });
});

module.exports = router;
