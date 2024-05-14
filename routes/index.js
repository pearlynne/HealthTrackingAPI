const { Router } = require("express");
const router = Router();

router.use("/auth", require("./auth"));
router.use("/users", require("./user"));
router.use("/reports", require("./reports"));
router.use("/appointments", require("./appointments"));

module.exports = router;