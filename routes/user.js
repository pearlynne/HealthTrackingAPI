const { Router } = require("express");
const router = Router({ mergeParams: true });

const userDAO = require("../daos/user");
const { isAuthenticated, isProvider } = require("../middleware/middleware");

// Mustache: Comment out for tests

// GET / Should get information of all patients for providers
router.get("/", isAuthenticated, isProvider, async (req, res, next) => {
  const userId = req.user._id;
  try {
    const users = await userDAO.getUsersOfProvider(userId);
    res.render(
      "users",
      { type: "Patient Information", user: users },
      (err, html) => {
        if (err) return next(err);
        res.render("partials/layout", {
          title: "Reports",
          content: html,
        });
      }
    );
  } catch (e) {
    next(e);
  }
});

// GeT /:id Should get patient's information for provider;
// get own information for patientt
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
        res.render(
          "users",
          { type: "Information", user: userInfo },
          (err, html) => {
            if (err) return next(err);
            res.render("partials/layout", {
              title: "Reports",
              content: html,
            });
          }
        );
      }
    } else {
      res.status(404).send("Not your Id");
    }
  } else {
    try {
      const user = await userDAO.getUser(email);
      const { _id, password, __v, roles, ...userInfo } = user;
      res.render(
        "users",
        { type: "Information", id: userId, user: userInfo },
        (err, html) => {
          if (err) return next(err);
          res.render("partials/layout", {
            title: "Reports",
            content: html,
          });
        }
      );
    } catch (e) {
      next(e);
    }
  }
});

// PUT /:id Should update provider Id for patient user
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
			console.log(updatedProvider)
      res.render(
        "users",
        {
          type: "Information",
          id: userId,
					user: updatedProvider,
          message: `Your new updated provider is: ${updatedProvider.providerId}`,
        },
        (err, html) => {
          if (err) return next(err);
          res.render("partials/layout", {
            title: "Reports",
            content: html,
          });
        }
      );
    } catch (e) {
      next(e);
    }
  }
});

module.exports = router;
