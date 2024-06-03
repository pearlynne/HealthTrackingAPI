const { Router } = require("express");
const router = Router({ mergeParams: true });

const userDAO = require("../daos/user");
const { isAuthenticated, isProvider } = require("../middleware/middleware");

router.get("/", isAuthenticated, isProvider, async (req, res, next) => {
  const userId = req.user._id;
  try {
    const users = await userDAO.getUsersOfProvider(userId);
		res.json(users);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", isAuthenticated, async (req, res, next) => {
  const userId = req.user._id;
  const roles = req.user.roles;
  const email = req.user.email;

  if (userId !== req.params.id) {
    if (roles.includes("provider")) {
      const user = await userDAO.getUsersOfProvider(userId, req.params.id);
      if (user.length === 0) {
        res
          .status(404)
          .send("You cannot access users that are not your patients");
      } else {
        res.json(user);
      }
    } else {
      res.status(404).send("Not your Id");
    }
  } else {
    try {
      const user = await userDAO.getUser(email);
      const { _id, password, __v, roles, ...userInfo } = user;
      res.json(userInfo);
    } catch (e) {
      next(e);
    }
  }
});

router.put("/:id/provider", isAuthenticated, async (req, res, next) => {
  const { providerId } = req.body;
  const userId = req.params.id;

  if (!providerId || !userId || JSON.stringify(req.body) === "{}") {
    res.status(400).send("Provider ID needed");
  } else if (userId !== req.user._id) {
    res.status(404).send("You are not allowed to access others' provider");
  } else {
    try {
      const updatedProvider = await userDAO.updateUserProvider(
        req.user._id,
        providerId
      );
      res.json(updatedProvider);
    } catch (e) {
      next(e);
    }
  }
});

module.exports = router;
