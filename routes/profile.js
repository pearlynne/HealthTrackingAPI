const { Router } = require("express");
const router = Router({ mergeParams: true });
const { isAuthenticated } = require("../middleware/middleware");

router.get("/", isAuthenticated, async (req, res, next) => {
	const userId = req.user._id;
  try {
    res.redirect(`/users/${userId}`)
  } catch (e) {
    next(e);
  }
});

module.exports = router;
