const { Router } = require("express");
const router = Router({ mergeParams: true });

const userDAO = require("../daos/user");
const { isAuthenticated, isProvider } = require("../middleware/middleware");

//Get user by ID
router.get("/:id", isAuthenticated, async (req, res, next) => {
  const userId = req.user._id;
  const email = req.user.email;

  if (userId !== req.params.id) {
    res.status(409).send("Conflicting data");
    // Confirm if this is the right status code
  }
  try {
    const user = await userDAO.getUser(email);
    res.json(user);
  } catch (e) {
    next(e);
  }
});

//Get All Users
router.get("/", isAuthenticated, isProvider, async (req, res, next) => {
  const userId = req.user._id;
  const providerId = req.user.providerId;

  //Case: Another provider is getting all users of another provider
  if (userId !== providerId) {
    res.status(409).send("Conflicting data");
    // Confirm if this is the right status code
  }
  try {
    const users = await userDAO.getUsersOfProvider(providerId);
    res.json(users);
  } catch (e) {
    next(e);
  }
});

router.put("/:id/provider", isAuthenticated, async (req, res, next) => {
  const { providerId } = req.body;
  const userId = req.params.id;

  if (!providerId || !userId || JSON.stringify(req.body) === "{}") {
    res.status(404).send("New provider ID needed");
  }

  if (userId !== req.userId._id) {
    res.status(403).send("Forbidden");
  }

  try {
    const updatedProvider = await userDAO.updateUserProvider(
      req.userId._id,
      providerId
    );
    res.json(updatedProvider);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
